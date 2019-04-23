GIT_REV = git rev-parse HEAD
deploy-scrapers:
	cd scrapers && pipenv lock -r requirements.txt
	docker build -t patchy-scrapers:${GIT_REV} -t patchy-scrapers:latest scrapers/
	docker run -t patchy-scrapers
test:
	cd scrapers && pipenv shell && nose
