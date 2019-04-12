# Installation
```
pip3 install pipenv
cd /path/to/this/repo
pipenv shell
pip install -r requirements.txt
```

# Run spiders locally
```
pipenv shell
scrapy crawl gamepedia_teams
scrapy crawl gamepedia_players
scrapy crawl riot_api_soloque_ids
```

# Deploy new version to cloud
```
pipenv shell
pipenv install
shub login
shub deploy
```
