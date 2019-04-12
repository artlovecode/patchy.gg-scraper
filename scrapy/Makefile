pre-deploy:
	pipenv lock -r > requirements.txt && docker-compose build
deploy:
	make pre-deploy && shub deploy
