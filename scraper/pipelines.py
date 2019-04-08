# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don'''t forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import re
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
            host="aws-us-east-1-portal.4.dblayer.com",
            dbname="compose",
            user="admin",
            password="FBRMKDOJVVLFGTIW",
            port=33037
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

        self.cur.execute('''INSERT INTO player(ingame_name, position_id, residence_region) VALUES(%s, %s) ON CONFLICT DO NOTHING''', (player['name'], position_id))


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

    def fetch_residence_region_id(self, player):
        self.cur.execute('''SELECT residence_region_id FROM player WHERE name = %s''', (player['name'],))
        return self.cur.fetchone()[0]


    def get_region_for_soloqueue_id(self, residence_region, soloqueue_id):
        region_in_name_rx = r"\w+\s\(\w+\)"
        region_in_name = re.search(region_in_name, soloqueue_id)
        if region_in_name is not None:
            return region_in_name
        else:
            return residence_region

    def insert_soloqueue_ids(self, player):
        residence_region = self.fetch_residence_region_id(player)
        soloqueue_ids = player.soloqueue_ids

        regions = [self.get_region_for_soloqueue_id(residence_region, soloqueue_id) for soloqueue_id in soloqueue_ids]
        ids_mapped_to_regions = zip(soloqueue_ids, regions)

        for (soloqueue_id, region) in ids_mapped_to_regions:
            self.cur.execute('''INSERT INTO soloqueue_id(player_id, name, region_id) VALUES(%s, %s) ON CONFLICT DO NOTHING''', (soloqueue_id, region_id))
        pass

    @check_pipeline
    def process_item(self, item, spider):
        self.insert_player(player)
        self.insert_current_team(player)
        self.insert_soloqueue_ids(player)

        self.db_conn.commit()
    pass


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
