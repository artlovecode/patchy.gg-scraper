import scrapy
from ..items import Team
from ..pipelines import Team as TeamPipeline

url_to_region = {
            "https://lol.gamepedia.com/Category:North_American_Teams": "NA",
            "https://lol.gamepedia.com/Category:European_Teams": "EU",
            "https://lol.gamepedia.com/Category:Korean_Teams": "KR",
            "https://lol.gamepedia.com/Category:Chinese_Teams": "CN",
            "https://lol.gamepedia.com/Category:LMS_Teams": "LMS",
            "https://lol.gamepedia.com/Category:Brazilian_Teams": "BR",
            "https://lol.gamepedia.com/Category:CIS_Teams": "CIS",
            "https://lol.gamepedia.com/Category:Japanese_Teams": "JP",
            "https://lol.gamepedia.com/Category:Latin_American_Teams": "LAT",
            "https://lol.gamepedia.com/Category:Oceanic_Teams": "OCE",
            "https://lol.gamepedia.com/Category:Southeast_Asian_Teams": "SEA",
            "https://lol.gamepedia.com/Category:Turkish_Teams": "TR",
            "https://lol.gamepedia.com/Category:Vietnamese_Teams": "VN"
            }

def get_teams_from_region(response):
    return Team({
            "name": response.xpath("//span[contains(@class, 'teamname')]/a/text()").extract(),
            "region": url_to_region[response.request.url]
            })

class Teams(scrapy.Spider):
    name = "gamepedia_teams"

    pipelines = [
        TeamPipeline
    ]

    start_urls = [
            "https://lol.gamepedia.com/Category:North_American_Teams",
            "https://lol.gamepedia.com/Category:European_Teams",
            "https://lol.gamepedia.com/Category:Korean_Teams",
            "https://lol.gamepedia.com/Category:Chinese_Teams",
            "https://lol.gamepedia.com/Category:LMS_Teams",
            "https://lol.gamepedia.com/Category:Brazilian_Teams",
            "https://lol.gamepedia.com/Category:CIS_Teams",
            "https://lol.gamepedia.com/Category:Japanese_Teams",
            "https://lol.gamepedia.com/Category:Latin_American_Teams",
            "https://lol.gamepedia.com/Category:Oceanic_Teams",
            "https://lol.gamepedia.com/Category:Southeast_Asian_Teams",
            "https://lol.gamepedia.com/Category:Turkish_Teams",
            "https://lol.gamepedia.com/Category:Vietnamese_Teams"
    ]

    def parse(self, response):
        return get_teams_from_region(response)
