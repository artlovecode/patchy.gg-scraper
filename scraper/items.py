# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# https://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class Player(scrapy.Item):
    # define the fields for your item here like:
    name = scrapy.Field()
    team_name = scrapy.Field()
    position = scrapy.Field()
    region = scrapy.Field()
    residency_region = scrapy.Field()
    soloqueue_ids = scrapy.Field()

class Team(scrapy.Item):
    # define the fields for your item here like:
    name = scrapy.Field()
    region = scrapy.Field()

class SoloqueId(scrapy.Item):
    # define the fields for your item here like:
    name = scrapy.Field()
    server = scrapy.Field()

