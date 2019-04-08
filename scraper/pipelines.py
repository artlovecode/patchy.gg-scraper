# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don'''t forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import psycopg2
from .items import Team, Player

class ScraperPipeline(object):
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

    def handle_team(self, team):
        names = team["name"]
        region = team["region"]

        self.cur.execute('''SELECT id FROM region WHERE name = %s;''', (region,))

        region_id = self.cur.fetchone()[0]

        for name in names:
            self.cur.execute('''INSERT INTO team(name, region_id) VALUES(%s, %s) ON CONFLICT DO NOTHING;''', (name, region_id))
        self.db_conn.commit()

        return team

    def get_players_team_id(self, player):
        self.cur.execute('''SELECT id FROM team WHERE name = %s''', (player['team_name'],))
        return self.cur.fetchone()[0]

    def get_players_position_id(self, player):
        self.cur.execute('''SELECT id FROM position WHERE name = %s''', (player['position'],))
        query_res = self.cur.fetchone()
        if query_res is not None:
            return query_res[0]
        else:
            return None

    def insert_player(self, player):
        position_id = self.get_players_position_id(player)
        self.cur.execute('''INSERT INTO player(ingame_name, position_id) VALUES(%s, %s) ON CONFLICT DO NOTHING''', (player['name'], position_id))

    def get_player_id(self, player: Player):
        self.cur.execute('''SELECT id FROM player WHERE ingame_name = %s;''', (player['name'],))
        return self.cur.fetchone()[0]

    def insert_current_team(self, player):
        player_id = self.get_player_id(player)
        team_id = self.get_players_team_id(player)
        self.cur.execute('''INSERT INTO current_team(player_id, team_id) VALUES(%s, %s) ON CONFLICT DO NOTHING''', (player_id, team_id))
        pass

    def get_team_region(self, player):
        self.cur.execute('''SELECT region_id FROM team WHERE name = %s''', (player['team_name'],))
        region_id = self.cur.fetchone()[0]
        self.cur.execute('''SELECT name FROM region WHERE id = %s''', (region_id,))
        return self.cur.fetchone()[0]
    
    def get_region_server(self, player):
        pass

    def insert_soloqueue_ids(self, player):
        region_in_name = r"\w+\(\w+\)"
        region_from_player_team = self.get_team_region(player)
        pass


    def handle_player(self, player):
        self.insert_player(player)
        self.insert_current_team(player)
        self.insert_soloqueue_ids(player)

        self.db_conn.commit()
        return player

    def process_item(self, item, spider):
        if spider.name == "gamepedia_players":
            return self.handle_player(item)
        elif spider.name == "gamepedia_teams":
            return self.handle_team(item)
        else:
            print("no handler")
            return item
