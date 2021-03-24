# 在线KTV

## 功能点

+   海量音乐，在线试听，随意下载，观看MV
+   用户有本站的歌单，也能同步QQ音乐中的歌单
+   在线KTV，实时音视频传输
+   在线多人聊天

## 技术栈

+   WebRTC
+   Flask Socketio

## 部署

**WebRTC的特殊需求：站点必须是https，因此需要申请SSL证书，否则无法进行实时音视频传输**

由于Flask_Socketio的特殊性，并未找到直接以https形式部署该服务的方法

因此推荐在nginx上通过反向代理，将SSL证书绑定到代理端口，项目部署到被代理端口(http)即可

**环境/包 要求**

+   SQLite env
+   python 3.x
    +   flask
    +   flask_socketio

## Api 列表

```python
@app.route("/login", methods=["POST"])
	# 用于用户登录，参数如下
    username = request.form['username']
    password = request.form['password']

@app.route("/sign", methods=["POST"])
	# 用于用户注册，参数如下
    username = request.form['username']
    password = request.form['password']

@app.route("/bindqq", methods=["POST"])
    # 用于绑定用户QQ号码，参数如下
    userid = request.form['userid']
    userqq = request.form['userqq']

@app.route("/add", methods=["POST"])
	# 用于添加音乐到用户歌单，参数如下
        userid = request.form['userid']
        songname = request.form['songname']
        songmid = request.form['songmid']
        interval = request.form['interval']
        singers = request.form['singers']
        album = request.form['album']
        albummid = request.form['albummid']
        videoid = request.form['videoid']
        songid = request.form['songid']

@app.route("/delete", methods=["POST"])
		# 用于从用户歌单删除音乐，参数如下
        userid = request.form['userid']
        songmid = request.form['songmid']

@app.route('/api/search')
	# 用于对关键词进行搜索，参数如下
    searchkey = request.args.get('searchkey')
    pageindex = request.args.get('pageindex')

@app.route('/api/singers')
	# 用于获取歌手排行
  
@app.route('/api/singersongs')
	# 用于获取歌手作品信息，参数如下
    pageindex = request.args.get('pageindex')
    singermid = request.args.get('singermid')

@app.route('/api/mvof/<string:mvid>', methods=['GET'])
	# 用于获取 mv url

@app.route('/api/urlof/<string:songmid>', methods=['GET'])
	# 用于获取 音乐 url

@app.route('/api/lyric/<string:songmid>', methods=['GET'])
    # 用于获取音乐歌词

@app.route('/api/toplisten', methods=['GET'])
    # 用于获取收藏数量前 num 位的歌曲
    num = request.args.get('num')
    
@app.route('/api/top/<string:date>', methods=['GET'])
	# 用于获取音乐榜单 1

@app.route('/api/hot/<string:date>', methods=['GET'])
	# 用于获取音乐榜单 2

@app.route('/api/songlist/<string:username>', methods = ['GET'])
	# 用于获取用户的站点歌单

@app.route('/api/accompany/<string:songname>', methods = ['GET'])
	# 用于获取歌曲伴奏

@app.route('/api/searchqquser/<string:qqnumber>', methods = ['GET'])
	# 用于获取QQ用户信息
  
@app.route('/api/qquserlist')
	# 用于同步QQ用户歌单，参数如下
    dissid = request.args.get('dissid')
    pageindex = request.args.get('pageindex')
```

## 演示视频

百度网盘链接

+   [海量音乐，在线试听，随意下载，观看MV](https://pan.baidu.com/s/14iG64Tv4luQ39nk9Kwx5RQ)  **密码**：wmo5
+   [用户有本站的歌单，也能同步QQ音乐中的歌单](https://pan.baidu.com/s/1eqY7m5QoIKVkM7C04OaeQg) **密码**：krpc
+   [在线KTV（实时音视频传输，在线多人聊天）](https://pan.baidu.com/s/1Q6cCrIZhAQ3CEfUz_DCfmQ )**密码**：ws85
