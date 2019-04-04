# -*- coding: utf-8 -*-
import scrapy
from items import Player

def map_position(position:str) -> str:
    position_map = {
            "Top Laner": "TOP",
            "Jungler": "JUN",
            "Mid Laner": "MID",
            "Bot Laner": "BOT",
            "Support": "SUP"
    }
    try :
        return position_map[position]
    except KeyError:
        return 'OTHER'

    


def get_teams_from_region(response):
    return (
        response.xpath("//span[contains(@class, 'teamname')]/a/@href").extract(),
        response.xpath("//span[contains(@class, 'teamname')]/a/text()").extract()
    )

def get_player_data(response) -> Player:
    sq_ids = response.xpath('//td[contains(text(), "Soloqueue IDs")]/following-sibling::td/text()').extract()
    position = response.xpath('//td[contains(text(), "Role")]/following-sibling::td[1]/text()').extract()[0]
    return Player({
        "team_name": response.meta["team_name"],
        "region": response.meta["region"][0],
        "name": response.xpath('//h1[contains(@id, firstHeading)]/text()').extract()[0],
        "position": map_position(position),
        "soloqueue_ids": [s.strip() for s in sq_ids[0].split(',')] if len(sq_ids) > 0 else sq_ids
    })

class Players(scrapy.Spider):
    name = "gamepedia_players"

    start_urls = [
            "https://lol.gamepedia.com/Category:North_American_Teams"
            "https://lol.gamepedia.com/Category:European_Teams",
            "https://lol.gamepedia.com/Category:Korean_Teams",
            "https://lol.gamepedia.com/Category:Chinese_Teams",
            "https://lol.gamepedia.com/Category:LMS_Teams",
            "https://lol.gamepedia.com/Category:Brazilian_Teams",
            "https://lol.gamepedia.com/Category:CIS_Teams",
            "https://lol.gamepedia.com/Category:Japanese_Teams",
            "https://lol.gamepedia.com/Category:Latin_America_North_Teams",
            "https://lol.gamepedia.com/Category:Latin_America_South_Teams",
            "https://lol.gamepedia.com/Category:Oceanic_Teams",
            "https://lol.gamepedia.com/Category:Southeast_Asian_Teams",
            "https://lol.gamepedia.com/Category:Turkish_Teams",
            "https://lol.gamepedia.com/Category:Vietnamese_Teams"
    ]

    BASE_URL = "http://lol.gamepedia.com"

    def get_team_data(self, response) -> scrapy.Request:
        player_links = response.xpath('//span[contains(@id, "Active")]/../following-sibling::table[1]//a/@href').extract()

        region = response.xpath('//table[contains(@id, "infoboxTeam")]//div[contains(@class, "region-icon")]/text()').extract()[0],
        for link in player_links:
            yield scrapy.Request(self.BASE_URL + link, callback = get_player_data, meta = { "region": region, "team_name": response.meta["teamname"]}) 

    def parse(self, response):
        (links, names) = get_teams_from_region(response)
        for (link, name) in zip(links, names):
            yield scrapy.Request(self.BASE_URL + link, callback = self.get_team_data, meta = {"teamname": name})
