import requests
import json
import base64
from hashlib import md5

qualities = [("M800", ".mp3"),("C600", ".m4a"),("M500", ".mp3"),("C400", ".m4a"),("C200", ".m4a"),("C100", ".m4a")]

header = {
    'referer' : 'http://y.qq.com',
    'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3493.3 Safari/537.36'
}

cookies = {
    'yqq_stat' : '0',
    'pgv_pvi' : '3169274880',
    'pgv_si' : 's9162564608',
    'pgv_info' : 'ssid : s7990758904',
    'pgv_pvid' : '3808568376',
    'ts_uid' : '3176730584', 
    'ts_last' : 'y.qq.com/portal/search.html',
    '_qpsvr_localtk' : '0.922195725504644',
    'pt2gguin' : 'o2835893638',
    'uin' : 'o2835893638',
    'skey' : '@SEqL6JzVT',
    'ptisp' : 'ctc',
    'RK' : 'JWhACjhwGi',
    'ptcz' : '12d3c22fb8f11acf4dbe05d9c722d0f93f0a92417724d3b8f846690ddfb71512',
    'luin' : 'o2835893638',
    'lskey' : '0001000059d2e8ea1b1bcd2d7dca99a9ceb5f8ed37f060d36f78d68aff8cdde723658e8677e81c3a679f1e33',
    'p_uin' : 'o2835893638',
    'pt4_token' : 'dSHejQ*sgOSxYQ0XmbqgwhflwKqILSwoFupJ5OjXwGA_',
    'p_skey' : 'DED1UMm246OIRvZTHPhnGh3ojCpPKPwahmKkLlYu1uA_',
    'p_luin' : 'o2835893638',
    'p_lskey' : '0004000082769f241adb60ec995025753305fb6cdfc923ee4b1c95de0f6292f1aa840d99b527fc4eec1ada1d',
    'ts_refer' : 'xui.ptlogin2.qq.com/cgi-bin/xlogin'
}

ips = [
    'http://180.153.119.146/vcloud1049.tc.qq.com/',
    'http://180.153.119.147/vcloud1049.tc.qq.com/',
    'http://180.153.119.148/vcloud1049.tc.qq.com/',
    'http://180.153.119.155/vcloud1049.tc.qq.com/',
    'http://180.153.119.156/vcloud1049.tc.qq.com/',
    'http://180.153.119.157/vcloud1049.tc.qq.com/',
    'http://180.153.99.154/vcloud1049.tc.qq.com/',
    'http://180.153.99.155/vcloud1049.tc.qq.com/',
    'http://180.153.99.156/vcloud1049.tc.qq.com/',
    'http://222.73.132.149/vcloud1049.tc.qq.com/',
    'http://222.73.132.150/vcloud1049.tc.qq.com/',
    'http://222.73.132.151/vcloud1049.tc.qq.com/'
]

def getmusicuri(songmid):
    try:
        # get value key
        # guid is a random number % 10000000000 (10 chars)
        msg = requests.get('https://c.y.qq.com/base/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=3757070001&format=json', headers=header)

        key = json.loads(msg.text)['key']
        for quality in qualities:
            testurl = "https://dl.stream.qqmusic.qq.com/" + quality[0] + songmid + quality[1] + "?vkey=" + key + "&guid=3757070001&uid=0&fromtag=30";
            try:
                msg = requests.get(testurl, headers=header)
                if msg.status_code == 200:
                    return testurl
            except:
                pass
        return 'NoRes'
    except:
        return 'NoKey'

def getkey():
    return requests.get('https://c.y.qq.com/base/fcgi-bin/fcg_musicexpress.fcg?json=3&guid=3757070001&format=json', headers=header).text


def getsearch(searchkey,pageindex = '1'):
    return requests.get('https://c.y.qq.com/soso/fcgi-bin/client_search_cp?cr=1&catZhida=1&n=20&p='+ pageindex +'&w='+ searchkey).text.strip('callback()')


# test songmid: 002WCV372JMZJw 001J5QJL1pRQYB
def getLyric(songmid):
    jsonstr = requests.get('https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?g_tk=5381&songmid=' + songmid,headers=header).text.strip('MusicJsonCallback()')
    lyricorign = base64.b64decode(json.loads(jsonstr)['lyric']).decode("utf-8")
    # print(lyricorign)
    return lyricorign[lyricorign.find('[00:'):]

def getSongDetail(songid,songmid):
    url = 'https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&data={"songinfo":{"method":"get_song_detail_yqq","param":{"song_type":0,"song_mid":"' + songmid + '","song_id":' + songid + '},"module":"music.pf_song_detail_svr"}}'
    return requests.get(url, headers=header).text

def getTopSongs(date):
    listurl = "https://szc.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?type=top&song_num=30&date=" + date + "&topid=5";
    return requests.get(listurl, headers=header).text



def getTopHotSongs(date):
    listurl = "https://szc.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?type=top&song_num=30&date=" + date + "&topid=26";
    return requests.get(listurl, headers=header).text
    # https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg?g_tk=944661439&jsonpCallback=MusicJsonCallbacksinger_track&loginUin=406143883&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&singermid=0025NhlN2yWrP4&order=listen&begin=30&num=30&songstatus=1
    # https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg?g_tk=944661439&jsonpCallback=MusicJsonCallbacksinger_track&loginUin=406143883&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&singermid=0025NhlN2yWrP4&order=listen&begin=0&num=30&songstatus=1

def getSingers():
    url = 'https://u.y.qq.com/cgi-bin/musicu.fcg?format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&data={"comm":{"ct":24,"cv":10000},"singerList":{"module":"Music.SingerListServer","method":"get_singer_list","param":{"area":-100,"sex":-100,"genre":-100,"index":-100,"sin":0,"cur_page":1}}}'
    return requests.get(url, headers=header).text

# 0025NhlN2yWrP4
def getSingerSongs(pageindex,singermid):
    url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg?g_tk=944661439&order=listen&num=30&songstatus=1&begin='+ pageindex +'&singermid=' + singermid
    return requests.get(url, headers=header).text


def getComments(albumid):
    # mv  - https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg?reqtype=2&biztype=5&cmd=8&needmusiccrit=0&pagenum=0&pagesize=25&topid=u00222le4ox  - videoid
    # song- https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg?reqtype=2&biztype=1&cmd=8&needmusiccrit=0&pagenum=0&pagesize=25&topid=102340965    - songid
    # reqtype=2 如果去掉就会返回评论中的表情
    url = 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg?reqtype=2&biztype=2&cmd=8&needmusiccrit=0&pagenum=0&pagesize=25&topid=' + albumid
    return requests.get(url, headers=header).text

def get_user_songlist(disstid,pageindex = 0):
    url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=1&nosign=1&song_begin=' + str(pageindex*30) + '&song_num=30&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&disstid=' + disstid
    result = requests.get(url, headers=header).text
    try:
        list = json.loads(result)['songlist']
    except:
        '''主人设置了权限，或者 “我喜欢” 中没有'''
        list = []
    return list

# url = 'https://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg?g_tk=944661439&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&cid=205360838&ct=20&reqfrom=1&reqtype=0&userid=' + userid;
def _get_user_dissid(userid):
    url = 'https://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg?hostUin=0&format=json&cid=205360838&reqfrom=1&reqtype=0&userid=' + userid;
    result = requests.get(url, headers=header).text
    user_diss_id = json.loads(result)['data']['mymusic'][0]['id']
    return user_diss_id

def search_user(number):
    url = 'https://c.y.qq.com/soso/fcgi-bin/client_search_user?p=1&n=30&searchid=239684060216084795&remoteplace=txt.yqq.user&format=json&w=' + number
    response = requests.get(url, headers=header,cookies = cookies).text
    user = json.loads(response)['data']['user']['list'][0]
    userid = user['docid']
    user_diss_id = _get_user_dissid(userid)
    user_songlist = get_user_songlist(user_diss_id)
    user_title = user['title']
    user_pic = user['pic']
    result = {
        'title':user_title,
        'pic':user_pic,
        'songlist':user_songlist,
        'dissid':user_diss_id
    }
    return json.dumps(result)

# m00119xeo83
# c0015vx9gdg
def getmv(mvid):
    url = 'https://u.y.qq.com/cgi-bin/musicu.fcg?data={"getMvUrl":{"module":"gosrf.Stream.MvUrlProxy","method":"GetMvUrls","param":{"vids":["'+ mvid +'"],"request_typet":10001}}}'
    result = requests.get(url, headers=header).text
    mp4s = json.loads(result)['getMvUrl']['data'][mvid]['mp4']
    result = {}
    result['ips'] = ips
    reses = []
    for mp4 in mp4s:
        a = mp4['cn'] + '?vkey=' + mp4['vkey']
        reses.append(a)
    result['reses'] = reses
    return json.dumps(result)


# 'http://trackercdn.kugou.com/i/v2/?hash=a774a794184af17469b27963e120b565&key=f1d8ccbaf7051d96d724ce908ec0301a&pid=3&behavior=play&cmd=25&version=8990'
# 'http://trackercdn.kugou.com/i/v2/?hash=7534c6e07202d8899ed518af6a14e0bf&key=83e9bfe939a23130a287bc9425baebbd&pid=3&behavior=play&cmd=25&version=8990'
def getfromkugou(songname):
    kugou_search_url = 'http://mobilecdn.kugou.com/api/v3/search/song?pagesize=1&plat=2&page=1&keyword=' + songname
    searchresult = json.loads(requests.get(kugou_search_url, headers=header).text)
    first_result_hash = searchresult['data']['info'][0]['hash']
    key = _mymd5(first_result_hash + 'kgcloudv2')
    # print(first_result_hash)
    # print(mymd5(first_result_hash + 'kgcloudv2'))
    urlinfo_url = 'http://trackercdn.kugou.com/i/v2/?hash=' + first_result_hash + '&key=' + key + '&pid=3&behavior=play&cmd=25&version=8990'
    urlinfo = json.loads(requests.get(urlinfo_url, headers=header).text)
    return urlinfo['url'][0]


def _mymd5(string):
    m = md5()
    m.update(string.encode('utf-8'))
    return(m.hexdigest())

def _getmv(mvid):
    url = 'https://u.y.qq.com/cgi-bin/musicu.fcg?data={"getMvUrl":{"module":"gosrf.Stream.MvUrlProxy","method":"GetMvUrls","param":{"vids":["'+ mvid +'"],"request_typet":10001}}}'
    return requests.get(url, headers=header).text

# print(json.loads(getmv('g0022q7z0um'))['getMvUrl']['data']['g0022q7z0um']['mp4'][4]['freeflow_url'][0])

'''
'http://101.227.216.150/vcloud1049.tc.qq.com/1049_M2103129000brJte3L4xeS1001538904.f40.mp4?vkey=E75677598E6DD2E340ACE656B0D6EDA437D7BF1964AFD7289ACE795CAF032BF83D2B097538788135DFC51F4C69BA0877B8237A83804A6694163E6FC1D43F2FCD80BED5F2BE06CF4C0198BCBD0AF5A943DDDB8EC70858C7B3'
'http://222.73.132.160/vcloud1049.tc.qq.com/1049_M2103129000brJte3L4xeS1001538904.f40.mp4?vkey=2DD51CB471AA82A26F75E2C273F6A34E96C536AE2EC60DC9E42C04BFB478DB60C35EA1DF7FB0D0D29B2B27D84AF5AAE976FDC24245BEF24F2CECC8BBFEAA4FB3300A5379F35FB133CBCDD0E822A4CACD04AA5607FFBB37AE'

'较弱：http://222.73.132.151/vcloud1049.tc.qq.com/1049_M0139200001jMHza2ei3OY1001122187.f40.mp4?vkey=96A80A51C1BB9E87ECF3FB15246F0068B33090034DA65E4F687728B7B210B7EE7A1EDAB0F54AA934F861D58EBD59B5B5BDA4CF13234F8441D52239B2511F7E614F9D30E9E7BDCCD88B99A892AA87390DDD162F682704D8B8'
'很强：http://180.153.119.152/vcloud1049.tc.qq.com/1049_M0139200001jMHza2ei3OY1001122187.f40.mp4?vkey=3A32976CD97B8440AC5E09304DC6954F31D75CDBA57611823DA1A64BDC0B5E418023F424871120ACFC6C4917588A50C1673BF4137F55104874DFC8B9D6B2AE24DC852D6A3BE83A19494C08F13F398B5E531B0BE9CAB665D8'

https://u.y.qq.com/cgi-bin/musicu.fcg?data={"getMvUrl":{"module":"gosrf.Stream.MvUrlProxy","method":"GetMvUrls","param":{"vids":["u00222le4ox"],"request_typet":10001}}}&g_tk=944661439&callback=jQuery112307099703611397317_1545047633425&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0
https://u.y.qq.com/cgi-bin/musicu.fcg?data={"getMvUrl":{"module":"gosrf.Stream.MvUrlProxy","method":"GetMvUrls","param":{"vids":["c0015vx9gdg"],"request_typet":10001}}}&g_tk=944661439&callback=jQuery112307099703611397317_1545047633425&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=GB2312&notice=0&platform=yqq&needNewCode=0

{
    "getMvUrl":{
        "module":"gosrf.Stream.MvUrlProxy",
        "method":"GetMvUrls",
        "param":{
            "vids":["u00222le4ox"],
            "request_typet":10001
            }
        }
}
'''