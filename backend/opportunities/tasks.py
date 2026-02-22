from celery import shared_task
from django.utils import timezone
import requests
from bs4 import BeautifulSoup
import re


DOMAIN_KEYWORDS = {
    'research': ['research', 'laboratory', 'lab', 'study', 'experiment', 'investigation'],
    'fellowship': ['fellowship', 'fellow', 'award', 'honor'],
    'internship': ['internship', 'intern', 'training', 'placement'],
    'scholarship': ['scholarship', 'grant', 'financial aid', 'funding', 'stipend'],
    'conference': ['conference', 'symposium', 'workshop', 'seminar'],
    'competition': ['competition', 'contest', 'challenge', 'hackathon'],
    'grant': ['grant', 'funding', 'support', 'award'],
}


def classify_domain(text):
    """NLP-lite domain classifier using keyword scoring."""
    text_lower = text.lower()
    scores = {domain: 0 for domain in DOMAIN_KEYWORDS}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[domain] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'other'


@shared_task
def scrape_opportunities_task(job_id):
    from opportunities.models import ScrapingJob, Opportunity
    try:
        job = ScrapingJob.objects.get(id=job_id)
        job.status = 'running'
        job.started_at = timezone.now()
        job.save()

        headers = {'User-Agent': 'Mozilla/5.0 (compatible; IvyLeagueBot/1.0)'}
        response = requests.get(job.source_url, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        count = 0

        # Generic opportunity extraction heuristic
        for article in soup.find_all(['article', 'div', 'li'], limit=50):
            title_el = article.find(['h1', 'h2', 'h3', 'a'])
            if not title_el or len(title_el.get_text(strip=True)) < 10:
                continue
            title = title_el.get_text(strip=True)[:500]
            desc = article.get_text(strip=True)[:1000]
            link = title_el.get('href', job.source_url)
            if link and not link.startswith('http'):
                from urllib.parse import urljoin
                link = urljoin(job.source_url, link)

            domain = classify_domain(title + ' ' + desc)

            # Deadline extraction
            deadline = None
            date_match = re.search(r'\b(\w+ \d{1,2},? \d{4})\b', desc)
            if date_match:
                from dateutil import parser as dateparser
                try:
                    deadline = dateparser.parse(date_match.group(1)).date()
                except Exception:
                    pass

            Opportunity.objects.get_or_create(
                url=link,
                defaults={
                    'title': title,
                    'description': desc,
                    'university': job.university,
                    'domain': domain,
                    'deadline': deadline,
                }
            )
            count += 1

        job.status = 'completed'
        job.opportunities_found = count
        job.completed_at = timezone.now()
        job.save()

    except Exception as e:
        if job_id:
            from opportunities.models import ScrapingJob
            ScrapingJob.objects.filter(id=job_id).update(
                status='failed',
                error_message=str(e),
                completed_at=timezone.now()
            )


@shared_task
def seed_sample_opportunities():
    """Seed realistic sample opportunities for demo purposes."""
    from opportunities.models import Opportunity
    from datetime import date, timedelta

    samples = [
        {'title': 'Harvard Research Experience for Undergraduates (REU)', 'university': 'Harvard University',
         'domain': 'research', 'description': 'Paid summer research internship at Harvard labs in STEM fields.',
         'deadline': date.today() + timedelta(days=30), 'status': 'open', 'stipend': '$5,000',
         'url': 'https://college.harvard.edu/research'},
        {'title': 'Yale Young Global Scholars Fellowship', 'university': 'Yale University',
         'domain': 'fellowship', 'description': 'Intensive academic enrichment program for exceptional students.',
         'deadline': date.today() + timedelta(days=45), 'status': 'open', 'stipend': 'Full scholarship',
         'url': 'https://globalscholars.yale.edu'},
        {'title': 'Princeton Internship in Civic Service', 'university': 'Princeton University',
         'domain': 'internship', 'description': 'Summer internship opportunities in public service and government.',
         'deadline': date.today() + timedelta(days=20), 'status': 'open', 'stipend': '$4,500',
         'url': 'https://pace.princeton.edu/students/apply-for-funding/pics'},
        {'title': 'Columbia University Research Scholars Program', 'university': 'Columbia University',
         'domain': 'scholarship', 'description': 'Merit-based scholarship for undergraduates pursuing research.',
         'deadline': date.today() + timedelta(days=60), 'status': 'open', 'stipend': '$10,000',
         'url': 'https://urf.columbia.edu'},
        {'title': 'MIT Lincoln Laboratory Research Internship', 'university': 'MIT',
         'domain': 'research', 'description': 'Technical research internship in AI, robotics and security.',
         'deadline': date.today() + timedelta(days=15), 'status': 'open', 'stipend': '$6,000',
         'url': 'https://www.ll.mit.edu/careers/student-opportunities'},
        {'title': 'Penn Medicine Summer Research Program', 'university': 'University of Pennsylvania',
         'domain': 'research', 'description': 'Clinical and translational research at Penn Medicine.',
         'deadline': date.today() + timedelta(days=25), 'status': 'open', 'stipend': '$3,800',
         'url': 'https://www.med.upenn.edu/pennur/'},
        {'title': 'Dartmouth Guarini School PhD Fellowship', 'university': 'Dartmouth College',
         'domain': 'fellowship', 'description': 'Fully funded PhD fellowship across all disciplines.',
         'deadline': date.today() + timedelta(days=90), 'status': 'upcoming', 'stipend': 'Full funding + stipend',
         'url': 'https://graduate.dartmouth.edu/fellowship'},
        {'title': 'Brown University UTRA Research Award', 'university': 'Brown University',
         'domain': 'grant', 'description': 'Undergraduate Teaching and Research Award for independent research.',
         'deadline': date.today() + timedelta(days=35), 'status': 'open', 'stipend': '$2,500',
         'url': 'https://college.brown.edu/academics/research/utra'},
    ]

    for s in samples:
        Opportunity.objects.get_or_create(url=s['url'], defaults=s)
