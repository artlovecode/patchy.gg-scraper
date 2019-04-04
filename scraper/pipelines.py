# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import psycopg2


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

    def handle_team(self, item):
        names = item["name"]
        region = item["region"]

        self.cur.execute('select id from region where name = %s;', (region,))

        region_id = self.cur.fetchone()[0]

        for name in names:
            self.cur.execute('insert into team(name, region_id) values(%s, %s) on conflict do nothing;', (name, region_id))
        self.db_conn.commit()

        return item

    def handle_player(self, item):
        name = item["name"]
        position = item["position"]
        team = item["team_name"]

        self.cur.execute('select id from team where name = %s', (team,))
        team_id = self.cur.fetchone()[0]
        
        self.cur.execute('select id from position where name = %s', (position,))
        position_id = self.cur.fetchone()

        if position_id is not None:
            position_id = position_id[0]

        self.cur.execute('insert into player(ingame_name, position_id) values(%s, %s) on conflict do nothing', (name, position_id))
        self.cur.execute('select id from player where ingame_name = %s', (name,))

        player_id = self.cur.fetchone()[0]

        self.cur.execute('insert into current_team(player_id, team_id) values(%s, %s) on confict do nothing', (player_id, team_id))


        self.db_conn.commit()
        return item

    def process_item(self, item, spider):
        if spider.name == "gamepedia_players":
            return self.handle_player(item)
        elif spider.name == "gamepedia_teams":
            return self.handle_team(item)
        else:
            print("no handler")
            return item
