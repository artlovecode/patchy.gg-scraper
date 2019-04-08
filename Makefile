pre-deploy:
	pipenv lock -r > requirements.txt && docker build -t patchy-gg-scraper .
