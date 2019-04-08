# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don'''t forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import re
import os
import logging
from functools import wraps
import psycopg2
from .items import Team, Player


def check_pipeline(process_item_method):
    @wraps(process_item_method)
    def wrapper(self, item, spider):
        if self.__class__ in spider.pipeline:
            return process_item_method(self, item, spider)
        else:
            return item

    return wrapper

class BasePipeline(object):
    def open_spider(self, spider):
        self.db_conn = psycopg2.connect(
            host=os.environ['COMPOSE_DB_HOST'],
            dbname=os.environ['COMPOSE_DB_NAME'],
            user=os.environ['COMPOSE_DB_USER'],
            password=os.environ['COMPOSE_DB_PW'],
            port=os.environ['COMPOSE_DB_PORT']
        )

        self.cur = self.db_conn.cursor()

    def close_spider(self, spider):
        self.cur.close()
        self.db_conn.close()


class PlayerPipeline(BasePipeline):
    def fetch_player_position_id(self, player):
        self.cur.execute('''SELECT id FROM position WHERE name = %s''', (player['position'],))
        query_res = self.cur.fetchone()
        if query_res is not None:
            return query_res[0]
        else:
            return None

    def insert_player(self, player):
        position_id = self.fetch_player_position_id(player)
        residency_region_id = self.fetch_residency_region_id(player)
        self.cur.execute('''INSERT INTO player(ingame_name, position_id, residency_region_id) VALUES(%s, %s, %s) ON CONFLICT (ingame_name) DO UPDATE SET (residency_region_id) = (EXCLUDED.residency_region_id)''', (player['name'], position_id, residency_region_id))


    def insert_current_team(self, player):
        player_id = self.fetch_player_id(player)
        team_id = self.fetch_team_id(player)
        self.cur.execute('''INSERT INTO current_team(player_id, team_id) VALUES(%s, %s) ON CONFLICT DO NOTHING''', (player_id, team_id))


    def fetch_team_id(self, player):
        self.cur.execute('''SELECT id FROM team WHERE name = %s''', (player['team_name'],))
        return self.cur.fetchone()[0]


    def fetch_player_id(self, player: Player):
        self.cur.execute('''SELECT id FROM player WHERE ingame_name = %s;''', (player['name'],))
        return self.cur.fetchone()[0]

    def fetch_residency_region_id(self, player):
        self.cur.execute('''SELECT id FROM region WHERE name = %s''', (player['residency_region'],))
        return self.cur.fetchone()[0]

    def fetch_region_id(self, region_name):
        self.cur.execute('''SELECT id FROM region WHERE name = %s''', (region_name, ))
        return self.cur.fetchone()[0]

    def fetch_region_name(self, region_id):
        self.cur.execute('''SELECT naem FROM region WHERE id = %s''', (region_id,))
        return self.cur.fetchone()[0]


    def get_region_for_soloqueue_id(self, residency_region_name, soloqueue_id):
        region_in_name_rx = r"\w+\s\(\w+\)"
        region_in_name = re.search(region_in_name_rx, soloqueue_id)
        if region_in_name is not None:
            return region_in_name.groups()[0]
        else:
            return residency_region_name

    def insert_soloqueue_ids(self, player):
        residency_region = player['residency_region']
        soloqueue_ids = player['soloqueue_ids']

        player_id = self.fetch_player_id(player)

        regions = [self.get_region_for_soloqueue_id(residency_region, soloqueue_id) for soloqueue_id in soloqueue_ids]
        ids_mapped_to_regions = zip(soloqueue_ids, regions)

        for (soloqueue_id, region) in ids_mapped_to_regions:
            self.cur.execute('''INSERT INTO soloqueue_id(player_id, name, region_id) VALUES(%s, %s, %s) ON CONFLICT DO NOTHING''', (player_id, soloqueue_id, self.fetch_region_id(region)))

    @check_pipeline
    def process_item(self, player, spider):
        self.insert_player(player)
        self.insert_current_team(player)
        self.insert_soloqueue_ids(player)

        self.db_conn.commit()
        return player 


class TeamPipeline(BasePipeline):

    @check_pipeline
    def process_item(self, team, spider):
        names = team["name"]
        region = team["region"]

        self.cur.execute('''SELECT id FROM region WHERE name = %s;''', (region,))

        region_id = self.cur.fetchone()[0]

        for name in names:
            self.cur.execute('''INSERT INTO team(name, region_id) VALUES(%s, %s) ON CONFLICT DO NOTHING;''', (name, region_id))
        self.db_conn.commit()
        return team
