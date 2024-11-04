(function (global, factory) {
      // 重写factory方法.让factory有独立的作用域
      var _factory = factory; factory = function(arkWeb, wasmoon) { return function(options) { return _factory(arkWeb, wasmoon)(options); }};
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@tencent/ark-web'), require('wasmoon')) :
  typeof define === 'function' && define.amd ? define(['@tencent/ark-web', 'wasmoon'], factory) :
  (global.Ark = factory(global.WebArk, global.wasmoon));
})(this, (function (arkWeb, wasmoon) {
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return Object.freeze(n);
  }

  var arkWeb__namespace = /*#__PURE__*/_interopNamespace(arkWeb);

  /**
   * @fileoverview 前置脚本注入
   * @author alawnxu
   * @date 2022-04-09 23:26:29
   * @version 1.0.0
   * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
   */

  /**
   * 暴露出局部变量.方便后续的模块挂载
   */
  let GlobalAppTemplates = {};
  const ArkGlobalContext = {
    /**
     * @private
     * @param {string} id 视图ID
     * @param {string} template 视图模板
     */
    _setViewTemplate(id, template) {
      GlobalAppTemplates[id] = template;
    },
    /**
     * 获取所有的模板
     * @public
     * @returns
     */
    getViewTemplates() {
      return GlobalAppTemplates;
    },
    /**
     * 释放所有模板
     * @date 2022-08-08 11:14:36
     */
    clearTemplates() {
      GlobalAppTemplates = {};
    }
  };

  const ArkWindow = Object.create({});
      const apis = [];
      apis.forEach(api => {
        let val;
        Object.defineProperty(ArkWindow, api, {
          get() {
            return val;
          },
          set(value) {
            val = value;
          }
        });
      });

  /**
   * @fileoverview 前置脚本注入(UI模块)
   * @author alawnxu
   * @date 2022-04-09 23:26:29
   * @version 1.0.0
   * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
   */

  const UI = new Proxy(arkWeb.UI, {
    get(target, propKey) {
      const func = target[propKey];
      if (typeof func === 'function') {

        /**
         * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
         * @update 2022年07月30日22:48:18
         * @author alawnxu
         */
        return function (...params) {
          return target[propKey](...params, ArkWindow);
        };
      }
      return target[propKey];
    },
  });

  /**
   * @fileoverview 前置脚本注入(Net模块)
   * @author alawnxu
   * @date 2022-04-09 23:26:29
   * @version 1.0.0
   * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
   */

  const Net = new Proxy(arkWeb.Net, {
    get(target, propKey) {
      const func = target[propKey];
      if (typeof func === 'function') {

        /**
         * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
         * @update 2022年07月30日22:48:18
         * @author alawnxu
         */
        return function (...params) {
          return target[propKey](...params, ArkWindow);
        };
      }
      return target[propKey];
    },
  });

  /**
   * @fileoverview 前置脚本注入
   * @author alawnxu
   * @date 2022-04-09 23:26:29
   * @version 1.0.0
   * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
   */

  const GlobalApplicationApis = {};
  ["CreateView","CreateRootView","GetRootView","GetTemplate","GetApplicationVersion"].forEach((method) => {
    GlobalApplicationApis[method] = function (...params) {
      const templates = ArkGlobalContext.getViewTemplates();

      /**
       * @description 这里之前传入global.app, 后面发现不太可行, 因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
       * @update 2022年07月30日22:48:18
       * @author alawnxu
       */
      const application = new arkWeb.Application(ArkWindow, templates);
      if (typeof application[method] === 'function') {
        return application[method](...params);
      }

      console.warn('Application not implement method:', method);
    };
  });

  const { CreateView,CreateRootView,GetRootView,GetTemplate,GetApplicationVersion } = GlobalApplicationApis;

  /**
   * @fileoverview 前置脚本注入(polyfill)
   * @author alawnxu
   * @date 2022-07-30 22:20:00
   * @version 1.0.0
   * @description 这个是一个模块文件. 变量请采用: __VAR__ 方式命名
   * 
   * 在Ark引擎中默认支持了 JSON.Stringify 和 JSON.Parse @see {@link /Users/alawnxu/workspace/qq/Ark/src/libs/net/httpwrapper.cpp}
   * 其实同 Net.JSONToTable 和 Net.TableToJSON
   * 
   * 在这里就通过注入的方式注册进去吧
   * 
   * 涉及到这个Api的Ark. 游戏中心所有的Ark因为走了单独的构建,所以都会使用到这个Api
   * @see {@link https://git.woa.com/sq-gamecenter-frontend-team/gc-ark-hub/tree/master/com_tencent_gamecenter_game_download}
   * @see {@link https://git.woa.com/group-pro/bot-frontend/bot-ark/tree/master/com_tencent_bot_groupbot}
   */
  (function() {
      JSON.Stringify = JSON.Stringify || JSON.stringify;
      JSON.Parse = JSON.Parse || JSON.parse;
  })();

  ArkGlobalContext._setViewTemplate('news', `
<View id="news" size="500,136" metadatatype="news">
	<Event>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
	</Event>
</View>`);

  ArkGlobalContext._setViewTemplate('music', `
<View id="music" size="500,113" metadatatype="music">
	<Event>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
	</Event>
</View>`);

  ArkGlobalContext._setViewTemplate('news_base', `
<View id="news" size="500,136" metadatatype="news">

	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>

    <Text id="title" margin="16,16,16,0" size="251,50" textcolor="0xff03081A" lineheight="20" value="&#x6807;&#x9898;" multiline="true" font="app.17" ellipsis="true" maxline="2" comment="&#x6807;&#x9898;"></Text>
            
    <Text id="desc" margin="16,44,0,0" size="152,48" textcolor="0xff878B99" lineheight="19.5" multiline="true" value="&#x6458;&#x8981;" font="app.14" maxline="3" ellipsis="true" comment="&#x6458;&#x8981;"></Text>
            
    <View id="preview" metadatatype="preview" size="52,52" margin="185,40,12,0" radius="4,4,4,4">
        <Texture color="0xFFF5F5F5"></Texture>
        <Image id="previewDefault" size="23,23" anchors="0" margin="1,1,1,1" value="res/images/pic-default.png"></Image>
        <Image id="background" anchors="15" mode="aspectfill"></Image>
    </View>
    
    <View id="seperator" visible="true" size="251,0.5" comment="&#x5206;&#x9694;&#x680F;&#xFF0C;&#x5206;&#x9694;bottom&#x533A;&#x57DF;">
        <Texture id="seperatorColor" color="0x7FE6E6E6"></Texture>
    </View>
    
    <View id="bottom" margin="0,105.6,0,0" size="256,17" comment="&#x5E95;&#x90E8;&#x6765;&#x6E90;&#x533A;&#x57DF;">
        <Image id="tagIcon" anchors="1" size="12,12" margin="0,0,0,0" radius="2,2,2,2" comment="&#x6765;&#x6E90;&#x56FE;&#x6807;" value="res/images/icon-default.png" mode="aspectfill"></Image>
        <Text id="tag" metadatatype="tag" anchors="15" margin="16,0,16,0" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.12" ellipsis="true" comment="&#x6765;&#x6E90;&#x6587;&#x672C;"></Text>
    </View>
       
    <View id="border" size="3,0" anchors="11" visible="false" comment="&#x5DE6;&#x8FB9;&#x8FB9;&#x6846;">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>

</View>
`);

  ArkGlobalContext._setViewTemplate('music_base', `
<View id="music" size="500,113" metadatatype="music">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="app.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
        
    <Text id="title" margin="12,22,84,0" anchors="7" size="200,24" textcolor="0xff03081A" value="&#x6807;&#x9898;" font="app.17" ellipsis="true" maxline="1"></Text>
    <Text id="desc" margin="12,46,84,0" anchors="7" size="200,20" textcolor="0xff878B99" value="&#x5185;&#x5BB9;" font="app.14" ellipsis="true" maxline="1"></Text>
            
    <View id="preview" metadatatype="preview" size="60,60" margin="0,12,12,0" anchors="6" radius="4,4,4,4">
        <Texture color="0xFFF5F5F5"></Texture>
        <Event>
            <OnClick value="app.OnClick" name="OnClick"></OnClick>
        </Event>
        <Image id="background" anchors="15" margin="0,0,0,0" mode="aspectfill"></Image>
        <Canvas id="iconAnime" anchors="15" margin="0,0,0,0"></Canvas>
    </View>
    
    <View id="seperator" anchors="7" margin="12,84,12,0" size="200,0.5">
        <Texture id="seperatorColor" color="0x7FE6E6E6"></Texture>
    </View>
    
	<View id="bottom" anchors="7" margin="12,90,12,6" size="251,17">
        <Layout type="ListLayout" orientation="Horizontal"></Layout>
        
        <Image id="tagIcon" size="12,12" margin="0,0,4,0" anchors="1" radius="2,2,2,2" mode="aspectfill"></Image>
        <Text id="tag" metadatatype="tag" margin="0,0,0,0" anchors="7" size="200,16" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.12" ellipsis="true"></Text>
	</View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>

</View>
`);

  ArkGlobalContext._setViewTemplate('news_channel', `<View id="news" size="500,136" metadatatype="news" comment="use max width for channel">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>

    <Text id="title" margin="16,16,16,0" size="251,50" textcolor="0xff03081A" value="&#x6807;&#x9898;" multiline="true" font="app.17" ellipsis="true" maxline="2"></Text>
    <Text id="desc" margin="16,44,0,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="3" ellipsis="true"></Text>
    <View id="preview" metadatatype="preview" size="50,50" margin="185,43,16,0">
        <Image id="background" anchors="15" mode="aspectfill" radius="4,4,4,4"></Image>
    </View>
    <View id="bottom" margin="0,105.6,0,0" size="257,30">
        <Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
    </View>
       
    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>

</View>
`);

  ArkGlobalContext._setViewTemplate('music_channel', `<View id="music" size="500,110" metadatatype="music" comment="use max width in channel">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="app.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
        
    <Text id="title" margin="16,16,16,0" size="200,20" textcolor="0xff03081A" value="&#x6807;&#x9898;" font="app.17" ellipsis="true" maxline="1"></Text>
    <Text id="desc" margin="16,44,0,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="2" ellipsis="true"></Text>
    <View id="preview" metadatatype="preview" size="50,50" margin="185,17,16,0">
        <Event>
            <OnClick value="app.OnClick" name="OnClick"></OnClick>
        </Event>
        <Image id="background" anchors="15" margin="0,0,0,0" radius="25,25,25,25"></Image>
        <Canvas id="iconAnime" anchors="15" margin="0,0,0,0"></Canvas>
    </View>
	<View id="bottom" margin="0,105.6,0,0" size="251,30">
		<Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
	</View>
    
    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>

</View>
`);

  ArkGlobalContext._setViewTemplate('video', `<View id="video" size="257,142" metadatatype="video">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>

    <Text id="title" margin="16,16,16,0" size="251,50" textcolor="0xff03081A" value="&#x6807;&#x9898;" font="app.17" multiline="true" ellipsis="true" maxline="2"></Text>
    <Text id="desc" margin="16,44,0,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="3" ellipsis="true"></Text>
    <View id="preview" size="50,50" margin="185,43,16,0">
        <Image id="background" anchors="15" radius="4,4,4,4"></Image>
        <Image id="playBtn" value="res/images/play_video.png" visible="false" size="33.5, 33.5" margin="0,0,0,0"></Image>
    </View>
	<View id="bottom" margin="0,105.6,0,0" size="251,30">
		<Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
	</View>

    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>

    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
</View>
`);

  ArkGlobalContext._setViewTemplate('contact', `<View id="contact" size="251,110" metadatatype="contact">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    
    
    <Text id="title" margin="16,16,16,0" size="200,20" textcolor="0xff03081A" value="&#x6807;&#x9898;" font="app.17" ellipsis="true" maxline="1"></Text>
    <Text id="desc" margin="16,44,0,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="3" ellipsis="true"></Text>
    <View id="preview" metadatatype="preview" size="50,50" margin="185,17,16,0">
        <Event>
            <OnClick value="app.OnClick" name="OnClick"></OnClick>
        </Event>
        <Image id="background" size="50,50" radius="4,4,4,4"></Image>
    </View>
	<View id="bottom" margin="0,105.6,0,0" size="251,30">
		<Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
	</View>
    
    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
</View>
`);

  ArkGlobalContext._setViewTemplate('messages', `<View id="messages" size="251,153" metadatatype="messages">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    <Text id="title" margin="16,16,16,0" size="251,50" textcolor="0xff03081A" value="&#x6807;&#x9898;" multiline="true" font="app.17" ellipsis="true" maxline="2"></Text>
    <Text id="desc" margin="16,44,16,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="3" ellipsis="true"></Text>
	<View id="bottom" margin="0,105.6,0,0" size="251,30">
		<Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
	</View>
    
    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
</View>
`);

  const code$k = `
          local viewModels = { }


local appConfig = nil

function getThemeConfig()
    
    if appConfig == nil then
        return nil
    end
    return appConfig["theme"]
end


function GetModel(view)
    while(view~=view:GetRoot())
    do
        if viewModels[view] then
            break
        else
            view = view:GetParent()
        end
    end

    local model = viewModels[view]
    if model and model.GetModel then
        return model:GetModel()
    end
    return model
end

function OnCreateView(view, template)
    utils.log("app.OnCreateView template=" .. template .. ", view=" .. tostring(view))
    
    if type(_G[template])=="table" then
        local model = _G[template].ViewModel:New(view)
        viewModels[view] = model
        model:Initialize(view)
    else
        app.log("OnCreateView.FatalError: No View Model for "..template)
    end
end


function translateMetaData(meta)
    if not meta or type(meta) ~= 'table' then
        return meta
    end

    local data = meta["music"] or meta["news"]
    if data then
        if data["source_icon"] then
            data["tagIcon"] = data["source_icon"]
        end
    end

    return meta
end

function OnSetMetadata(sender, value)
    utils.log("app.OnSetMetadata.sender=" .. tostring(sender))

    local obj = app.GetModel(sender)
    if obj == nil then
        return
    end

    obj:OnSetMetadata(translateMetaData(value))
end

function OnDestroyView(view, template)
    while(view~=view:GetRoot())
    do
        if viewModels[view] then
            break
        else
            view = view:GetParent()
        end
    end
    viewModels[view]:Deinitialize()
    viewModels[view] = nil
end

function OnActivate(view, active)
    local model = app.GetModel(sender)
    if model == nil or model.OnActivate == nil then return end
    model:OnActivate(view, active)
end

function OnShare(view)
end

function OnResize(sender, srcWidth, srcHeight, dstWidth, dstHeight)
    local model = app.GetModel(sender)
    if model == nil or model.OnResize == nil then return end
    model:OnResize(dstWidth, dstHeight)
end

function OnClick(sender, x, y, button, keyState)
    local model = app.GetModel(sender)
    if model == nil or model.OnClick == nil then
        utils.log("app.OnClick, model not found, sender=" .. tostring(sender))
        return
    end
    utils.log("app.OnClick, sender=" .. tostring(sender)
        .. ", model=" .. tostring(model))
    model:OnClick(sender)
end

function OnTouchStart(sender, x, y, button, keyState)
    local model = app.GetModel(sender)
    if model == nil or model.OnClick == nil then
        return
    end
    model:OnTouchStart(sender, x)
end

function OnCustomEvent(sender, event, data)
    local model = app.GetModel(sender)
    if model == nil then return end
    model:OnCustomEvent(sender, event, data)
end

function GetAppName()
    return "struct.msg"
end

local debugEnable = true
function debug(msg)
    if debugEnable == true then
        Console.Log("ark_struct_msg: "..msg)
    end
end

function log(msg)
    Console.Log("ark_struct_msg: "..msg)
end

function OnConfigChange(config)
    utils.log("app.OnConfigChange appconfig="..Net.TableToJSON(config))
    if config then
        appConfig = config
    else
        utils.log("app.OnConfigChange, config is nil")
    end
    for view, model in pairs(viewModels) do
        if model ~= nil and model.model~=nil and model.model.OnConfigChange ~= nil then
            utils.log("app.OnConfigChange, view=" .. tostring(view) .. ", model=" .. tostring(model))
            model.model:OnConfigChange(config)
        elseif model ~= nil and model.OnConfigChange ~= nil then
          utils.log("app.OnConfigChange, view=" .. tostring(view) .. ", model=" .. tostring(model))
          model:OnConfigChange(config)

        else
            utils.log("app.OnConfigChange, no model, appconfig="..Net.TableToJSON(config))
        end
    end
end

function OnStartup(config)
    utils.log("app.OnStartup appconfig="..Net.TableToJSON(config))
    if config then
        appConfig = config
    else
        utils.log("app.OnStartup, config is nil")
    end
    for _, model in pairs(viewModels) do
        if model ~= nil and model.model.OnStartup ~= nil then
            model.model:OnStartup(config)
        end
    end
end

          _G['app'] = {
            viewModels = viewModels,appConfig = appConfig,getThemeConfig = getThemeConfig,GetModel = GetModel,OnCreateView = OnCreateView,translateMetaData = translateMetaData,OnSetMetadata = OnSetMetadata,OnDestroyView = OnDestroyView,OnActivate = OnActivate,OnShare = OnShare,OnResize = OnResize,OnClick = OnClick,OnTouchStart = OnTouchStart,OnCustomEvent = OnCustomEvent,GetAppName = GetAppName,debugEnable = debugEnable,debug = debug,log = log,OnConfigChange = OnConfigChange,OnStartup = OnStartup
          }
        `;

  const code$j = `
          



function printViewTree(view, depth)

    if not depth then
        depth = 0
    end
    
    local id = view:GetID()
    local l, t, r, b = view:GetRect()
    log(string.format("%s%s<%s>: pos=%.1f,%.1f size=%.1f,%.1f visible=%s",
        string.rep(" ", depth*2), 
        view:GetType(), id, 
        l, t, r-l, b-t, 
        tostring(view:GetVisible())
        ))
    
    if not view.GetFirstChild then
        return
    end
    
    local child = view:GetFirstChild()
    while child do
        printViewTree(child, depth+1)
        child = view:GetNextChild(child)
    end
end

function log(text)
    Console.Log(tostring(text))
    if QQ and QQ.Log then
        QQ.Log(tostring(text))
    end
end
          _G['debug'] = {
            printViewTree = printViewTree,log = log
          }
        `;

  const code$i = `
          


function GetStyle(view, key)
    if not view or not view.GetStyle then
        return nil
    end
    
    key = key .. ":"
    
    local style = view:GetStyle()
    
    local startPos = string.find(style, key, 1)
    if startPos == nil then
        return nil
    end
    
    local endPos = string.find(style, ";", startPos)
    if endPos == nil then
        endPos = -1
    else 
        endPos = endPos - 1
    end

    return string.sub(style, startPos + string.len(key), endPos)
end


function SetStyle(view, key, value)
    if not view or not view.GetStyle then
        return false
    end
    if not key or not value then
        return false
    end
    
    
    local style = view:GetStyle()
    local startPos = string.find(style, key .. ":")
    if startPos == nil then
        return style .. ";" .. key .. ":" .. value 
    end
    
    local endPos = string.find(style, ";", startPos)
    if endPos == nil then
        endPos = -1
    else 
        endPos = endPos
    end
    
    local newStyle = string.sub(style, 1, startPos - 1)
    newStyle = newStyle .. key .. ":" .. value .. ";"
    if endPos > 0 then
        newStyle = newStyle .. string.sub(style, endPos + 1)
    end
    
    view:SetStyle(newStyle)
    return true
end
          _G['flexutil'] = {
            GetStyle = GetStyle,SetStyle = SetStyle
          }
        `;

  const code$h = `
          
          _G['fontutil'] = {
            
          }
        `;

  const code$g = `
          

function GetImageSize(url, callback) 
    if callback == nil then
        return
    end
    
    local image = UI.Image()
    image:AttachEvent("OnLoad", function()
        image:DetachEvent("OnLoad")
        local w, h = image:GetSize()
        callback(url, w, h)
    end)
    
end
          _G['picutil'] = {
            GetImageSize = GetImageSize
          }
        `;

  const code$f = `
          

function GetQQVer()
    if not QQ or not QQ.GetVersion then
        return 0
    end

    local verString = QQ.GetVersion()
    local it = string.gmatch(verString, "(%d+)%.(%d+)%.(%d+)")
    if not it then
        return 0
    end
    local v1, v2, v3 = it()
    return tonumber(v1) * 10000 + tonumber(v2) * 100 + tonumber(v3)
end

function getAvatarUrl(uin) 
    return string.format("https://q.qlogo.cn/g?b=qq&nk=%s&s=100", uin)
end

function IsInAIO(view) 
    
    

    local info = QQ.GetContainerInfo(view) 
    if not info then
        return false
    end
    
    local chatType = info["ChatType"]
    if chatType == nil or chatType == 0 or chatType == -1 or
        chatType == "0" or chatType == "-1" then
        return false
    end
    return true
end
          _G['qqutil'] = {
            GetQQVer = GetQQVer,getAvatarUrl = getAvatarUrl,IsInAIO = IsInAIO
          }
        `;

  const code$e = `
          



function measureText(text, font) 
    local t = UI.Text()
    if font then
        t:SetFont(font)
    end
    t:SetAutoSize(true)
    t:SetValue(text)
    return t:MeasureTextSize()
end


          _G['textutil'] = {
            measureText = measureText
          }
        `;

  const code$d = `
          


local ThemeID = {
    ConciseWhite = "2971",          
    ConciseGray  = "2921",          
    ConciseBlack = "2920",          
    
    DefaultDefault = "2100",        
    AndroidDefaultBlack = "1103",   
    iOSDefaultBlack = "1102",       
   
    ConciseGreen  = "3063",         
    ConciseYellow = "3064",         
    ConcisePurple = "3065",         
    ConcisePink   = "3066",         
    ConciseRed    = "3067",         
    
    TIMDefault = "1015712",         
}



function shouldShowLeftBorder(view)
    return isCurrentInGuildAIO(view)
end


function isCurrentInGuildAIO(view)

    
    

    if not QQ or not QQ.GetContainerInfo then
        return false
    end
    
    local info = QQ.GetContainerInfo(view) 
    if not info then
        utils.log("isCurrentInGuildAIO, get container info return null")
        return false
    end
    utils.log("isCurrentInGuildAIO, current chat type is " .. tostring(info["ChatType"]))
    
    
    local AIO_TYPE_GUILD = "7" 
    return AIO_TYPE_GUILD == info["ChatType"]
end



THEME_COLOR_BACKGROUND = "background"
THEME_COLOR_BOTTOM = "bottom"
THEME_COLOR_BORDER = "border"
THEME_COLOR_TITLE = "title"
THEME_COLOR_SUMMARY = "summary"
THEME_COLOR_SOURCE = "source"
THEME_COLOR_TAG = "tag" 
THEME_COLOR_TAG_BACKGROUND = "tag-background" 
THEME_COLOR_SEPERATOR = "seperator"
THEME_COLOR_PIC_BORDER = "pic-border"

local COLOR_WHITE = 0xFFFFFFFF
local COLOR_LIGHT_GRAY = 0xFFF5F6FA
local COLOR_GRAY = 0xFFFAFAFA
local COLOR_LIGHT_BLUE = 0xFF0099FF

local COLOR_GRAY_GUILD = 0x0B485560
local COLOR_GUILD_TITLE = 0xFF222222
local COLOR_GUILD_SUMMARY = 0xFFB2B2B2

local COLOR_SCHEME_DEFAULT = {
    [THEME_COLOR_BACKGROUND] = 0xFFFFFFFF,
    [THEME_COLOR_TITLE] = 0xFF03081A,
    [THEME_COLOR_SUMMARY] = 0xFF878B99,
    [THEME_COLOR_SOURCE] = 0xFF878B99,
    [THEME_COLOR_TAG] = 0xFFFFFFFF,
    [THEME_COLOR_TAG_BACKGROUND] = 0x21000000,
    [THEME_COLOR_SEPERATOR] = 0xFFE5E5E5,
    [THEME_COLOR_PIC_BORDER] = 0xFFE5E5E5,
}


local COLOR_SCHEME_NIGHT = {
    [THEME_COLOR_BACKGROUND] = 0xFF1F1F1F,
    [THEME_COLOR_TITLE] = 0xFFFFFFFF,
    [THEME_COLOR_SUMMARY] = 0xFF8D8D93,
    [THEME_COLOR_SOURCE] = 0xFF8D8D93,
    [THEME_COLOR_TAG] = 0xFF8D8D93,
    [THEME_COLOR_TAG_BACKGROUND] = 0x21FFFFFF,
    [THEME_COLOR_SEPERATOR] = 0XFF1A1A1A,
    [THEME_COLOR_PIC_BORDER] = 0XFF1A1A1A,
}

local COLOR_SCHEME_CONCISE_WHITE = {
    [THEME_COLOR_BACKGROUND] = 0xFFFFFFFF,
    [THEME_COLOR_TITLE] = 0xFF000000,
    [THEME_COLOR_SUMMARY] = 0xFF999999,
    [THEME_COLOR_SOURCE] = 0xFF999999,
    [THEME_COLOR_TAG] = 0xFFFFFFFF,
    [THEME_COLOR_TAG_BACKGROUND] = 0x21000000,
    [THEME_COLOR_SEPERATOR] = 0xFFE5E5E5,
    [THEME_COLOR_PIC_BORDER] = 0xFFE5E5E5,
}


local COLOR_SCHEME_CONCISE_NIGHT = {
    [THEME_COLOR_BACKGROUND] = 0xFF262626,
    [THEME_COLOR_TITLE] = 0xFFFFFFFF,
    [THEME_COLOR_SUMMARY] = 0xFF999999,
    [THEME_COLOR_SOURCE] = 0xFF999999,
    [THEME_COLOR_TAG] = 0xFF999999,
    [THEME_COLOR_TAG_BACKGROUND] = 0x21FFFFFF,    
    [THEME_COLOR_SEPERATOR] = 0XFF1A1A1A,
    [THEME_COLOR_PIC_BORDER] = 0XFF1A1A1A,
}

local COLOR_SCHEME_GUILD = {
    [THEME_COLOR_BACKGROUND] = COLOR_GRAY_GUILD,
    [THEME_COLOR_BOTTOM] = 0,
    [THEME_COLOR_BORDER] = COLOR_LIGHT_BLUE,
    [THEME_COLOR_TITLE] = COLOR_GUILD_TITLE,
    [THEME_COLOR_SUMMARY] = COLOR_GUILD_SUMMARY,
    [THEME_COLOR_SOURCE] = COLOR_GUILD_SUMMARY,
}


local COLOR_SCHEME_GUILD_NIGHT = {
    [THEME_COLOR_BACKGROUND] = 0xFF2D2D35,
    [THEME_COLOR_BOTTOM] = 0xFF2D2D35,
    [THEME_COLOR_BORDER] = COLOR_LIGHT_BLUE,
    [THEME_COLOR_TITLE] = 0xFFE8E9EA,
    [THEME_COLOR_SUMMARY] = 0xFF838387,
    [THEME_COLOR_SOURCE] = 0xFF838387,
}



function getThemeColorConfig(view)
    local root = nil
    if view ~= nil then
        root = view:GetRoot()
    end
    
    
    if isCurrentInGuildAIO(root) then
        return getThemeColorConfigForChannel()
    end
    

    local theme = app.getThemeConfig()
    
    if theme == nil then 
        utils.log("theme config is nil")
        return COLOR_SCHEME_DEFAULT
    end

    local mode = theme["mode"]
    local themeId = theme["themeId"]
    utils.log("theme: mode="..mode..",themeId="..themeId)
    
    
    if mode ~= nil and mode == "concise" then
        if themeId == ThemeID.ConciseBlack then
            utils.log("theme: concise black")
            return COLOR_SCHEME_CONCISE_NIGHT
        else
            utils.log("theme: concise default")
            return COLOR_SCHEME_CONCISE_WHITE
        end
    end
    
    
    if themeId == ThemeID.iOSDefaultBlack 
        or themeId == ThemeID.AndroidDefaultBlack then
        utils.log("theme: default night")
        return COLOR_SCHEME_NIGHT;
    else
        
        utils.log("theme: default")
        return COLOR_SCHEME_DEFAULT  
    end
end

function getThemeColorConfigForChannel()
    if isDarkTheme() then
        return COLOR_SCHEME_GUILD_NIGHT
    else
        return COLOR_SCHEME_GUILD
    end
end


function shouldSetMaskLayer(theme)
    if theme == nil then
        return false
    end
    
    local mode = theme["mode"]
    local themeId = theme["themeId"]

    if mode ~= nil and mode == "concise" and themeId ~= nil then
        if themeId == ThemeID.ConciseWhite 
               or themeId == ThemeID.ConciseGray 
               or themeId == ThemeID.ConciseGreen
               or themeId == ThemeID.ConciseYellow
               or themeId == ThemeID.ConcisePurple
               or themeId == ThemeID.ConcisePink
               or themeId == ThemeID.ConciseRed 
               or themeId == ThemeID.TIMDefault then
            return false
        else 
            return true
        end
    else
        
        if themeId == ThemeID.AndroidDefaultBlack or themeId == ThemeID.iOSDefaultBlack then
            return true
        end
        return false
    end
end

function isDarkTheme()
    
    

    local theme = app.getThemeConfig()
    
    if theme == nil then 
        return false
    end

    local mode = theme["mode"]
    local themeId = theme["themeId"]
    
    
    if themeId == ThemeID.iOSDefaultBlack 
        or themeId == ThemeID.AndroidDefaultBlack then
        return true
    end
    
    
    if mode ~= nil and mode == "concise" then
        if themeId == ThemeID.ConciseBlack then
            return true
        end
    end
    
    return false
end


function getLoadingImage()
    if isDarkTheme() then
        return "res/images/loading_white.png"
    else
        return "res/images/loading_black.png"
    end
end

function setColor(elem, color)
    if elem == nil then
        return
    end
        
    local elemType = elem:GetType()
    if elemType == "Texture" then
        elem:SetValue(color)
    elseif elemType == "Text" then
        elem:SetTextColor(color)
    else
        utils.log("unknown element type: " .. elemType)
    end     
end


          _G['theme'] = {
            ThemeID = ThemeID,shouldShowLeftBorder = shouldShowLeftBorder,isCurrentInGuildAIO = isCurrentInGuildAIO,THEME_COLOR_BACKGROUND = THEME_COLOR_BACKGROUND,THEME_COLOR_BOTTOM = THEME_COLOR_BOTTOM,THEME_COLOR_BORDER = THEME_COLOR_BORDER,THEME_COLOR_TITLE = THEME_COLOR_TITLE,THEME_COLOR_SUMMARY = THEME_COLOR_SUMMARY,THEME_COLOR_SOURCE = THEME_COLOR_SOURCE,THEME_COLOR_TAG = THEME_COLOR_TAG,THEME_COLOR_TAG_BACKGROUND = THEME_COLOR_TAG_BACKGROUND,THEME_COLOR_SEPERATOR = THEME_COLOR_SEPERATOR,THEME_COLOR_PIC_BORDER = THEME_COLOR_PIC_BORDER,COLOR_WHITE = COLOR_WHITE,COLOR_LIGHT_GRAY = COLOR_LIGHT_GRAY,COLOR_GRAY = COLOR_GRAY,COLOR_LIGHT_BLUE = COLOR_LIGHT_BLUE,COLOR_GRAY_GUILD = COLOR_GRAY_GUILD,COLOR_GUILD_TITLE = COLOR_GUILD_TITLE,COLOR_GUILD_SUMMARY = COLOR_GUILD_SUMMARY,COLOR_SCHEME_DEFAULT = COLOR_SCHEME_DEFAULT,COLOR_SCHEME_NIGHT = COLOR_SCHEME_NIGHT,COLOR_SCHEME_CONCISE_WHITE = COLOR_SCHEME_CONCISE_WHITE,COLOR_SCHEME_CONCISE_NIGHT = COLOR_SCHEME_CONCISE_NIGHT,COLOR_SCHEME_GUILD = COLOR_SCHEME_GUILD,COLOR_SCHEME_GUILD_NIGHT = COLOR_SCHEME_GUILD_NIGHT,getThemeColorConfig = getThemeColorConfig,getThemeColorConfigForChannel = getThemeColorConfigForChannel,shouldSetMaskLayer = shouldSetMaskLayer,isDarkTheme = isDarkTheme,getLoadingImage = getLoadingImage,setColor = setColor
          }
        `;

  const code$c = `
          TouchState={
}

function TouchState:New(view)
	local obj = {}
    setmetatable(obj, self)
    self.__index = self
    obj:Initialize(view)
	return obj
end

function TouchState:New(view, textureID, oldValue, newValue)
	local obj = {}
    setmetatable(obj, self)
    self.__index = self
    obj:Initialize(view)
    self.oldValue = oldValue;
    self.newValue = newValue;
    self.textureID = textureID;
	return obj
end

function TouchState:Initialize(view)
    self.view = view
    self.touch_icon = self.view:GetUIObject("touch_layer_icon")
    self.touch_layer_container = self.view:GetUIObject("touch_layer_container")
    self.buttonview = view:GetUIObject("button_view")
end

function TouchState:ShowPressState(texture, oldColor, newColor, texture1, oldColor1, newColor1)
    if self.timer~= nil then
        self.timer:Stop()
        self.timer = nil
    end
    
    self.timer = Timer()
    self.timer:SetInterval(300)
    texture:SetValue(newColor)
    texture1:SetValue(newColor1)
    self.timer:AttachEvent("OnTimer", function()
        
        texture:SetValue(oldColor)
        texture1:SetValue(oldColor1)
        self.timer:Stop()
        self.timer = nil
    end)
    self.timer:Start()
end


function OnTouchStart(sender,data)
    local obj = app.GetModel(sender)
    if obj == nil or obj.touch then 
        utils.log("touch.OnTouchStart, obj not found")
        return 
    end
    
    if sender ~= sender:GetRoot() then
        return
    end
    
    if obj.touch.textureID ~= nil then
        obj.touch.texture = obj.touch.view:GetTexture(obj.touch.textureID)
    end

    if obj.touch.texture ~= nil then
        obj.touch.texture:SetValue(obj.touch.newValue)
    end
    if(obj.touch.touch_icon~=nil) then
        obj.touch.touch_icon:SetVisible(true) 
    end  
end



function OnTouchEnd(sender)
    local obj = app.GetModel(sender)
    if obj == nil or obj.touch == nil then 
        utils.log("touch.OnTouchEnd, obj not found")
        return 
    end
    
    if(obj.pressed == true) then return end 
    
    
    if (obj.timer == nil) then
        obj.timer = Timer()
        obj.timer:SetInterval(100)
     end
     obj.timer:AttachEvent("OnTimer", function()
        if obj.touch.texture ~= nil then
            obj.touch.texture:SetValue(obj.touch.oldValue)
        end
        if(obj.touch.touch_icon~=nil) then
           obj.touch.touch_icon:SetVisible(false) 
        end
        obj.timer:Stop()
        obj.timer = nil
     end)
     obj.timer:Start()
end


function OnTouchCancel(sender)
    
    local obj = app.GetModel(sender)
    if obj == nil or obj.touch == nil then 
        utils.log("touch.OnTouchCancel, obj not found")
        return 
    end
    
    if(obj.pressed == true) then return end 
    
    if (obj.timerTouch == nil) then
         obj.timerTouch = Timer()
         obj.timerTouch:SetInterval(100)
    end
    obj.timerTouch:AttachEvent("OnTimer", function()
    

        if obj.touch.texture ~= nil then
            obj.touch.texture:SetValue(obj.touch.oldValue)
        end
            if(obj.touch.touch_icon~=nil) then
            obj.touch.touch_icon:SetVisible(false) 
        end
            obj.timerTouch:Stop()
            obj.timerTouch = nil
    end)
    obj.timerTouch:Start()
end


function setPressed(sender,pressed)
    local obj = app.GetModel(sender)
    if(obj==nil) then return end
    
    if sender ~= sender:GetRoot() then
        return
    end
   
    if obj.touch.textureID ~= nil then
        obj.touch.texture = obj.touch.view:GetTexture(obj.touch.textureID)
    end

    if pressed == true then
        if obj.touch.texture ~= nil then
            obj.touch.texture:SetValue(obj.touch.newValue)
        end
        if(obj.touch.touch_icon~=nil) then
            obj.touch.touch_icon:SetVisible(true) 
        end
    else
        if obj.touch.texture ~= nil then
            obj.touch.texture:SetValue(obj.touch.oldValue)
        end
        if(obj.touch.touch_icon~=nil) then
           obj.touch.touch_icon:SetVisible(false) 
        end
    end
end


function OnViewEvent(sender, eventName, data)
    local obj = app.GetModel(sender)
    utils.log("OnViewEvent : eventName".. tostring(eventName))
    if(obj==nil) then return end
    
    if eventName == "ViewPressed" and data["pressed"] ~= nil then
        if data["pressed"] == true then
            obj.pressed = true
            setPressed(sender, true)
        else
            obj.pressed = false
            setPressed(sender, false)
        end
    end
end
          _G['touch'] = {
            TouchState = TouchState,OnTouchStart = OnTouchStart,OnTouchEnd = OnTouchEnd,OnTouchCancel = OnTouchCancel,setPressed = setPressed,OnViewEvent = OnViewEvent
          }
        `;

  const code$b = `
          


function SetColor(elem, color)
    if elem == nil then
        return
    end
        
    local elemType = elem:GetType()
    if elemType == "Texture" then
        elem:SetValue(color)
    elseif elemType == "Text" then
        elem:SetTextColor(color)
    else
        utils.log("unknown element type: " .. elemType)
    end     
end


function AdjustViewWidth(width)
    
    if utils.isIOS() then
        return width
    end
    
    return math.floor(width * 96 / 100)
end


function SetRootSize(view, width, height)
    local root = view:GetRoot()
    root:SetSize(width, height)    
end



          _G['uiutil'] = {
            SetColor = SetColor,AdjustViewWidth = AdjustViewWidth,SetRootSize = SetRootSize
          }
        `;

  const code$a = `
          local urlchecklist= {}

function fixurl(url, oldValue, isHttps)
    
    if url == "local" or url == nil or string.len(url) == 0 then
        return oldValue
    end

    
    if string.find(url, "miniapp://") == 1 or
        string.find(url, "mqqapi://") == 1 or
        string.find(url, "res:") == 1 then
        return url
    end

    if string.find(url, "http:") == 1 or string.find(url, "https:") == 1 then
        return url
    end
    if isHttps ~= nil and isHttps == true then
        return "https://" .. url
    end

    
    return "http://" .. url
end

function getFontHeightDelta(fontsize)
    local delta = 0
    if fontsize < 20 then
        delta = 5
    elseif fontsize < 30 then
        delta = 8
    elseif fontsize < 40 then
        delta = 11
    elseif fontsize < 50 then
        delta = 14
    end

    if utils.getArkVersion() <= 7 then
        return delta
    end
    return 0
end

function getArkVersion()
    
    return 35
end

function loadUrl(url, view)
    if QQ and QQ.OpenUrl then
        if isWin() then
            QQ.OpenUrl(url)
        else
            QQ.OpenUrl(url, view)
        end
        return true
    end
    return false
end

ReportIndex = {
    INDEX_MUSIC = 0,
    INDEX_VIDEO = 1,
    INDEX_NEWS = 2,
    INDEX_CONTACT = 3,
    INDEX_MESSAGES = 4
}

function report()

end

function asyncCallback(time, func)
    local timer = Timer()
    timer:SetInterval(time)
    timer:AttachEvent("OnTimer", function()
       func()
       timer:Stop()
       timer = nil
    end)
    timer:Start()
end

local function createHttpRequest()
    if Net ~= nil and Net.HttpRequest ~= nil then
        return Net.HttpRequest()
    end
    return Http.CreateHttpRequest()
end

function isIOS()
    local str = System.GetOS()
    if str ~= nil and str == "iOS" then
        return true
    end
    return false
end

function isWin()
    local str = System.GetOS()
    if str ~= nil and str == "Windows" then
        return true
    end
    return false
end

function isAndroid()
    local str = System.GetOS()
    if str ~= nil and str == "Android" then
        return true
    end
    return false
end

function UpdateImage(imageObj, imageUrl, default)
    if imageObj == nil then
        return
    end

    local cgi = "https://cgi.connect.qq.com/qqconnectopen/openapi/change_image_url?url=".. imageUrl
    local httpGet = createHttpRequest()
    httpGet:SetTimeout(15000)
    httpGet:AttachEvent("OnComplete", function(http)
        
        local temp = httpGet
        httpGet = nil

        if not http:IsSuccess() then
            utils.log("update webp fail : ".. tostring(http:GetStatusCode()))
            imageObj:SetValue(default)
            return
        end
        local data = http:GetData("text/json")
        if data == nil or type(data)~="table" then
            app.debug("data is nil")
            imageObj:SetValue(default)
            return
        end

        local result = data["result"]
        if result == nil or type(result)~="table" then
            app.debug("result is nil")
            imageObj:SetValue(default)
            return
        end

        local url = result["url"]
        app.debug("url "..imageUrl.." is webp and translated to ".. url)
        if url ~= nil then
            Storage.Save(imageUrl, url)
            if imageUrl == url then
                utils.log("same url")
            end
            imageObj:SetValue(url)
        else
            app.debug("url is nil")
            imageObj:SetValue(default)
        end
    end)
    app.debug("webp translation: "..cgi)
    httpGet:Get(cgi, true)
end


function SetImageValue(imageObj, imageUrl, default, onSetValue)
    if imageObj == nil then
        return
    end

    if string.find(imageUrl, "res:") == 1 and imageUrl ~= nil then
        imageObj:SetValue(imageUrl)
        return
    end

    local setImageValue = function(value, success)
        imageObj:SetValue(value)
        if onSetValue ~= nil then
            onSetValue(success)
        end
    end

    local originUrl = imageUrl
    local storedUrl = Storage.Load(imageUrl, "")
    if storedUrl ~= nil then
        if string.find(storedUrl, "cache:") == 1 then
            app.debug("SetImageValue find a cache")
            setImageValue(storedUrl, true)
            return
        end
        imageUrl = storedUrl
    end

    local httpGet = createHttpRequest()
    httpGet:SetTimeout(5000)
    httpGet:AttachEvent("OnComplete", function(http)
        
        local temp = httpGet
        httpGet = nil

        if not http:IsSuccess() then
            utils.log("SetImageValue failed : ".. tostring(http:GetStatusCode()))
            setImageValue(default, false)
            return
        end
        local cachePath = http:GetCachePath()
        if cachePath ~= nil then
            Storage.Save(originUrl, cachePath)
            setImageValue(cachePath, true)
        else
            app.debug("cachePath is nil")
            setImageValue(default, false)
        end
    end)
    httpGet:Get(imageUrl, true)
end


CacheHelper = {}
function CacheHelper:GetInstance()
    if self.obj then
        return self.obj
    else
        local obj = {}
        setmetatable(obj, self)
        self.__index = self
        self.obj = obj
        return obj
    end
end

function CacheHelper:GetCache(key, maxAge)
    if not key then return nil end
    local cache = nil
    cache = Storage.Load(key)
    if cache ~= nil and cache ~= ""  and cache.time then
        if type(maxAge)=="number" and (maxAge<0 or os.time() - cache.time < maxAge) then
            return cache.value
        else
            self:RemoveCache(key)
        end
    end
    return nil
end

function CacheHelper:SetCache(key, value)
    if not key then return end
    local cache = {
        value = value,
        time = os.time(),
    }
    local ret = Storage.Save(key, cache)
    if not ret then
        modapi.Log(string.format("%s.Storage.Save.Failed: key=%s", app.GetAppName(), key))
    end
    return ret
end

function CacheHelper:RemoveCache()
    if not key then return end
    return Storage.Save(key, "")
end

--%E7%BD%91%E7%BB%9C
local NetHelper = {
    TIMEOUT = 30000,
}
function NetHelper:GetInstance()
    if self.obj then
        return self.obj
    else
        local obj = {}
        setmetatable(obj, self)
        self.__index = self
        self.obj = obj
        return obj
    end
end

local function GetByte(str, count)
    if type(str)~="string" then return "" end
    local len = #str
    if count > len then count = len end
    local st = {}
    for i = 1, count do
        table.insert(st, string.byte(str, i))
    end
    return table.concat(st, " ")
end

function NetHelper:AsycGetNetImage(url, onLoading, onSuccess, onFailed)
    if not url or not onSuccess then
        if onFailed then onFailed() end
        return
    end
    local httpReturned = false
    local http = Net.HttpRequest()
    http:AttachEvent("OnComplete", function()
        httpReturned = true
        local path = http:GetCachePath()
        modapi.Log(string.format("%s.AsycGetNetImage.status: %s, url: %s, data: %s", app.GetAppName(), tostring(http:GetStatusCode()), url, GetByte(http:GetData("text/plain"), 8)))
        if not http:IsSuccess() or path == nil then
            modapi.Log(string.format("%s.AsycGetNetImage.CompleteAndFailed.%s", app.GetAppName(), url))
            if onFailed then onFailed() end
            return
        end
          onSuccess(path)
    end)
    if type(http.SetTimeout)=="function" then
        http:SetTimeout(NetHelper.TIMEOUT)
    else
        local timer = Timer()
        timer:SetInterval(NetHelper.TIMEOUT)
        timer:AttachEvent("OnTimer", function()
            timer:Stop()
            if httpReturned then return end
            http:Abort()
            modapi.Log(string.format("%s.AsycGetNetImage.Timer.%s", app.GetAppName(), url))
            if onFailed then onFailed() end
        end)
        timer:Start()
    end
    http:Get(url, true)
    if onLoading then onLoading() end
end

function NetHelper:AsycHttpGetJson(url, onLoading, onSuccess, onFailed)
    if not url or not onSuccess then
        if onFailed then onFailed() end
        return
    end
    local httpReturned = false
    local http = Net.HttpRequest()
    http:AttachEvent("OnComplete", function()
        httpReturned = true
        local json = http:GetData("application/json")
        modapi.Log(string.format("%s.AsycHttpGetJson.status: %s, url: %s", app.GetAppName(), tostring(http:GetStatusCode()), url))
        if not http:IsSuccess() or json==nil then
            modapi.Log(string.format("%s.AsycHttpGetJson.CompleteAndFailed.%s", app.GetAppName(), url))
            if onFailed then onFailed() end
            return
        end
        onSuccess(json)
    end)
    if type(http.SetTimeout)=="function" then
        http:SetTimeout(NetHelper.TIMEOUT)
    else
        local timer = Timer()
        timer:SetInterval(NetHelper.TIMEOUT)
        timer:AttachEvent("OnTimer", function()
            timer:Stop()
            if httpReturned then return end
            http:Abort()
            modapi.Log(string.format("%s.AsycHttpGetJson.Timer.%s", app.GetAppName(), url))
            if onFailed then onFailed() end
        end)
        timer:Start()
    end
    http:Get(url)
    if onLoading then onLoading() end
end

function NetHelper:SSOParamsToStr(params)
    if type(params)~= "table" then return "" end
    local rest = {}
    for k, v in pairs(params) do
        if type(v)=="table" then
            table.insert(rest, string.format("%s={%s}", tostring(k), tostring(self:SSOParamsToStr(v))))
        else
            table.insert(rest, string.format("%s=%s", tostring(k), tostring(v)))
        end
    end
    return table.concat(rest, ", ")
end

function NetHelper:SSORequest(svccmd, params, onLoading, onSuccess, onFailed)
    if onLoading then onLoading() end
    if not svccmd or type(params)~="table" or not onSuccess then
        if onFailed then onFailed() end
        return
    end
    local request = QQ.DataRequest()
    request:AttachEvent("OnComplete", function()
        local ret = request:GetData("json")
        modapi.Log(string.format("%s.SSORequest.return.%s, %s", app.GetAppName(), tostring(svccmd), tostring(self:SSOParamsToStr(params))))
        if request:IsSuccess() and ret and ret.data then
            onSuccess(ret.data)
        else
            modapi.Log(string.format("%s.SSORequest.Failed.%s, %s, %s", app.GetAppName(), tostring(svccmd), tostring(self:SSOParamsToStr(params)), tostring(ret)))
            if onFailed then onFailed() end
        end
    end)
    if not request:Open(svccmd) then
        modapi.Log(string.format("%s.SSORequest.OpenFailed.%s.%s", app.GetAppName(), svccmd, self:SSOParamsToStr(params)))
        if onFailed then onFailed() end
        return
    end

    request:SetTimeout(NetHelper.TIMEOUT)
    if not request:Send(params) then
        modapi.Log(string.format("%s.SSORequest.SendFailed.%s.%s", app.GetAppName(), svccmd, self:SSOParamsToStr(params)))
        if onFailed then onFailed() end
        return
    end
end


function setMaskLayer(view)
     local touch_icon = view:GetUIObject("touch_layer_icon")
     local touchTexture = touch_icon:GetTexture("touchTexture")
     if touchTexture ~= nil then
         touchTexture:SetValue(0x50000000) 
         Console.Log("%E5%A4%9C%E9%97%B4%E6%A8%A1%E5%BC%8F%EF%BC%8C%E8%AE%BE%E7%BD%AE%E8%92%99%E5%B1%82%E9%80%8F%E6%98%8E%E5%BA%A6")
     end
end

function setBackground(view, themeConfig)

    if view == nil then
        utils.log("setBackground, return, view is nil")
        return
    end

    local root = view:GetRoot()
    local colorConfig = theme.getThemeColorConfig(root)

    local border = view:GetUIObject("border")
    local texture = view:GetTexture("bgColor")
    local bottom = view:GetUIObject("bottom")
    local seperator = view:GetUIObject("seperator")
    local bottomTexture = bottom:GetTexture("bottomBg")
    local seperatorTexture = nil
    if seperator ~= nil then
        seperatorTexture = seperator:GetTexture("seperatorColor")
    end

    
    if texture ~= nil then
        texture:SetValue(colorConfig[theme.THEME_COLOR_BACKGROUND])
    end
    if bottomTexture ~= nil then
        bottomTexture:SetValue(colorConfig[theme.THEME_COLOR_BOTTOM])
    end
    if seperatorTexture ~= nil then
        seperatorTexture:SetValue(colorConfig[theme.THEME_COLOR_SEPERATOR])
    end

    
    setThemeTextColor(view, "title", colorConfig[theme.THEME_COLOR_TITLE])
    setThemeTextColor(view, "desc", colorConfig[theme.THEME_COLOR_SUMMARY])
    setThemeTextColor(view, "tag", colorConfig[theme.THEME_COLOR_SOURCE])


    
    if border then
        border:SetVisible(theme.shouldShowLeftBorder(view:GetRoot()))
        local borderTexture = border:GetTexture("borderBg")
        if borderTexture ~= nil then
            borderTexture:SetValue(colorConfig[theme.THEME_COLOR_BORDER])
        end
    end

    
    if theme.shouldSetMaskLayer(themeConfig) then
        setMaskLayer(view)
    end
end


function setThemeTextColor(view, textID, color)
    if color == nil or color == 0 then
        return
    end

    local text = view:GetUIObject(textID)
    if not text or not text.SetTextColor then
        return
    end

    text:SetTextColor(color)
end



function getSafeUtf8String(s)
    if System.GetOS and System.GetOS() == 'Android' then
        return s,false
    end
    local ss = {}
    local findReverse = false
    local k = 1
    while true do
        if k > #s then
            break
        end
        local c = string.byte(s,k)
        if not c then
            break
        end
        if c < 192 then 
            k = k + 1
            table.insert(ss, string.char(c))
        elseif c < 224 then 
            local c1 = string.byte(s,k+1)
            table.insert(ss, string.char(c,c1))
            k = k + 2
        elseif c < 240 then 
            local c1 = string.byte(s,k+1)
            local c2 = string.byte(s,k+2)

            
            if c == 226 and c1 == 129 and c2 == 167 then
                findReverse = true
                table.insert(ss, string.char(32))
            else
                table.insert(ss, string.char(c,c1,c2))
            end
            k = k + 3
        elseif c < 248 then 
            local c1 = string.byte(s,k+1)
            local c2 = string.byte(s,k+2)
            local c3 = string.byte(s,k+3)
            table.insert(ss, string.char(c,c1,c2,c3))
            k = k + 4
        elseif c < 252 then 
            local c1 = string.byte(s,k+1)
            local c2 = string.byte(s,k+2)
            local c3 = string.byte(s,k+3)
            local c4 = string.byte(s,k+4)
            table.insert(ss, string.char(c,c1,c2,c3,c4))
            k = k + 5
        elseif c < 254 then 
            local c1 = string.byte(s,k+1)
            local c2 = string.byte(s,k+2)
            local c3 = string.byte(s,k+3)
            local c4 = string.byte(s,k+4)
            local c5 = string.byte(s,k+5)
            table.insert(ss, string.char(c,c1,c2,c3,c4,c5))
            k = k + 6
        end
    end

    local safeStr = s
    if findReverse then
        safeStr = table.concat(ss)
    end
    return safeStr,findReverse
end

function setSafeText(view,content)
   if view == nil or content == nil then
       return
   end
   local safeContent,findReverse = utils.getSafeUtf8String(content)
   view:SetValue(safeContent)
   if findReverse then
       QQ.Report(view:GetRoot():GetID(), 0, "FindReverse")
       Console.Log("report find reverse string content:"..content)
   end
end

function log(text)
    Console.Log(tostring(text))
    if QQ and QQ.Log then
        QQ.Log(tostring(text))
    end
end


          _G['utils'] = {
            urlchecklist = urlchecklist,fixurl = fixurl,getFontHeightDelta = getFontHeightDelta,getArkVersion = getArkVersion,loadUrl = loadUrl,ReportIndex = ReportIndex,report = report,asyncCallback = asyncCallback,createHttpRequest = createHttpRequest,isIOS = isIOS,isWin = isWin,isAndroid = isAndroid,UpdateImage = UpdateImage,SetImageValue = SetImageValue,CacheHelper = CacheHelper,NetHelper = NetHelper,GetByte = GetByte,setMaskLayer = setMaskLayer,setBackground = setBackground,setThemeTextColor = setThemeTextColor,getSafeUtf8String = getSafeUtf8String,setSafeText = setSafeText,log = log
          }
        `;

  const code$9 = `
          
MusicPlayer = {
	STATE_STOP = 0,
	STATE_PLAYING = 1,
	STATE_PAUSE = 2,
	MsgSeq_Keyboard = "keyboard",
	MsgSeq_Rich = "rich",
	MsgSeq_Share = "share",
	Id2SeqTag = "Id2Seq",
}

function MusicPlayer:GetInstance()
	local obj = nil
	if self.obj then
		obj = self.obj
	else
		obj = {}
		setmetatable(obj,self)
		self.__index = self
		self.obj = obj
		
        obj:Initialize()
	end
	return obj
end

function MusicPlayer:Initialize()
	self.playingIdKey = string.format("%s.PlayingId", "struct.audio")
	self.cacheHelper = utils.CacheHelper:GetInstance()
	local playingTable = self.cacheHelper:GetCache(self.playingIdKey, 10*60)
	if type(playingTable) == "table" then
        if playingTable.seq then self.currSeq = tostring(playingTable.seq) end
        if playingTable.url then self.currUrl = tostring(playingTable.url) end
	end
	self.state = MusicPlayer.STATE_STOP
	self.listenerList = {}
	
	
	local testTime = -5
	local GetCurrentTime = QQMusic and QQMusic.GetCurrentTime or (function() 
		testTime = testTime + 1
		if testTime >= 21 then testTime = 0 end
		return testTime
	end)
	local GetDuration = QQMusic and QQMusic.GetDuration or (function() return 20 end)
	self.GetProcess = function(self)
		local time = GetCurrentTime()
		local duration = GetDuration()
        
		if duration > 0 and time>=0 and time<=duration then
			return time/duration
		else
			return 0
		end
	end

	if QQMusic and QQMusic.SetCallback then
		QQMusic.SetCallback(function(state, dict)
            local changeFlag = false
			if state ~= nil then
				local newState = self:QQMusicStateToMyState(state)
				
				if newState~=nil and newState~=self.state then
					self.state = newState
					changeFlag = true
				end
			end
			newSeq, newUrl = self:ProcessDict("QQMusicCallBack", dict)
			if newSeq~=self.currSeq then
				self.currSeq = newSeq
				changeFlag = true
			end
            
            if newUrl~=self.currUrl then
                self.currUrl = newUrl
                changeFlag = true
            end
            
            if changeFlag then self:OnStateChange() end
        end)
    end
end

function MusicPlayer:ProcessDict(tag, dict)
    app.log("ProcessDict dict = "..tostring(dict))
	local newSeq, newUrl
	if type(dict)=="table" then
        app.log("ProcessDict dict = "..tostring(dict))
		if dict.url and dict.url~="" then
            newUrl = dict.url
			local cache = self.cacheHelper:GetCache(string.format("Url2Id.%s", dict.url), 24*60*60)
			if type(cache)=="table" then
				
				if cache.seq~= nil then newSeq = tostring(cache.seq) end
                if cache.url~= nil then newUrl = tostring(cache.url) end
			else
				app.log(string.format("%s.%s.Can't get seq from url.%s", app.GetAppName(), tag, dict.url))
			end
		end
	else
		
	end
	return newSeq, newUrl
end

function MusicPlayer:UpdatePlayingState()
	self.state = self:GetQQMusicState()
	if QQMusic and QQMusic.GetCurrentSong then
		QQMusic.GetCurrentSong(function(dict)
			self.currSeq ,self.currUrl= self:ProcessDict("GetCurrentSong", dict)
			
            self:OnStateChange()
		end)
	end
end

function MusicPlayer:QQMusicStateToMyState(QQMusicState)
    local result = nil
    if QQMusicState ~= nil then
        if QQMusicState == 0 then
            result = MusicPlayer.STATE_STOP
        elseif QQMusicState == 1 then
            result = MusicPlayer.STATE_PLAYING
        elseif QQMusicState == 2 then
            result = MusicPlayer.STATE_PAUSE
        elseif QQMusicState == 3 then
            result = MusicPlayer.STATE_STOP
        elseif QQMusicState == 4 then
            result = MusicPlayer.STATE_STOP
        elseif QQMusicState == 5 then
            result = MusicPlayer.STATE_STOP
        end
    end
    return result
end

function MusicPlayer:SavePlayingSeq(url, seq)
	self.cacheHelper:SetCache(string.format("Url2Id.%s", url), {
		seq = seq,
        url = url,
	})
	self.cacheHelper:SetCache(self.playingIdKey, {
		seq = seq,
        url = url,
	})
end

function MusicPlayer:RawPlay(url, jump, title, author, seq)
	if QQMusic and QQMusic.Play then
		QQMusic.Play(url, {
			url = jump,
			title = title,
			singer = author,
			id = tostring(1)
			}
		)
	end
    
	self.state = MusicPlayer.STATE_PLAYING
	self.currSeq = seq
    self.currUrl = url
    self:SavePlayingSeq(url, seq)
	self:OnStateChange()
end

function MusicPlayer:RawStop()
	if QQMusic and QQMusic.Stop then
		QQMusic.Stop()
	end
    
	self.state = MusicPlayer.STATE_STOP
	self.currSeq = nil
    self.currUrl = nil
    app.log(string.format("RawStop self.currUrl:%s",self.currUrl))
	self:OnStateChange()
end

function MusicPlayer:RawPause()
	if QQMusic and QQMusic.Pause then
		QQMUsic.Pause()
	end
	
	self.state = MusicPlayer.STATE_PAUSE
        app.log(string.format("RawPause self.currUrl:%s",self.currUrl))
	self:OnStateChange()
end

function MusicPlayer:RawResume()
	if QQMusic and QQMusic.Resume then
		QQMusic.Resume()
	end
	
	self.state = MusicPlayer.STATE_PLAYING
        app.log(string.format("RawResume self.currUrl:%s",self.currUrl))
	self:OnStateChange()
end

function MusicPlayer:Play(url, jump, title, author, seq)
	if self.state == MusicPlayer.STATE_STOP then
		self:RawPlay(url, jump, title, author, seq)
	elseif self.state == MusicPlayer.STATE_PLAYING then
		if url == self.currUrl and seq == self.currSeq then
			
		else
			self:RawStop()
			self:RawPlay(url, jump, title, author, seq)
		end
	elseif self.state == MusicPlayer.STATE_PAUSE then
		if url == self.currUrl and seq == self.currSeq then
			self:RawResume()
		else
			self:RawStop()
			self:RawPlay(url, jump, title, author, seq)
		end
	end
end

function MusicPlayer:Stop()
	if self.state == MusicPlayer.STATE_STOP then
		
	elseif self.state == MusicPlayer.STATE_PLAYING then
		self:RawStop()
	elseif self.state == MusicPlayer.STATE_PAUSE then
		self:RawStop()
	end
end

function MusicPlayer:Pause()
	if self.state == MusicPlayer.STATE_STOP then
		
	elseif self.state == MusicPlayer.STATE_PLAYING then
		self:RawPause()
	elseif self.state == MusicPlayer.STATE_PAUSE then
		
	end
end

function MusicPlayer:Resume()
	if self.state == MusicPlayer.STATE_STOP then
		
	elseif self.state == MusicPlayer.STATE_PLAYING then
		
	elseif self.state == MusicPlayer.STATE_PAUSE then
		self:RawResume()
	end
end

function MusicPlayer:GetState()
	return self.state, self.currSeq, self.currUrl
end

function MusicPlayer:GetQQMusicState()
	if QQMusic and QQMusic.GetState then
		local case = tonumber(QQMusic.GetState())
        
		local newState = self:QQMusicStateToMyState(case)
        if newState~=nil then
			return newState
		else
			return self.state
		end
	else
		return self.state
	end
end

function MusicPlayer:AddListener(key, fun)
    if key then 
        self.listenerList[key] = fun
    end
end

function MusicPlayer:RemoveListener(key)
    if key then
        self.listenerList[key] = nil
    end
end

function MusicPlayer:OnStateChange()
    for _, v in pairs(self.listenerList) do
        if v then v(self.state, self.currSeq, self.currUrl) end
    end
end


MusicData = {
    APP_ID = "100497308",
    APP_KEY = "8498609f25f65295491a1d866e4f0258",
    DEVICE_ID = "123456",
    RetryTime = 3,
    ReloadTime = 2000,
	ERROR_NORES = 1,

    musicStreamUrl = "http://open.music.qq.com/fcgi-bin/fcg_music_get_playurl.fcg?song_id=%s&redirect=1&filetype=m4a&qqmusic_fromtag=50&app_id=%s&app_key=%s&device_id=%s&isnew=1",
    musicInfoUrl = "http://open.music.qq.com/fcgi-bin/fcg_music_get_song_info_batch.fcg?song_id=%s&format=json&app_id=%s&app_key=%s&device_id=%s",
	musicRecommendUrl = "http://open.music.qq.com/fcgi-bin/fcg_music_get_toplist_info.fcg?app_id=%s&app_key=%s&device_id=%s&format=json&itemid=26&pagesize=%d&sin=1",
	searchUrl = "http://open.music.qq.com/fcgi-bin/fcg_music_search.fcg?w=%s&utf8=%d&p=%d&num=%d&app_id=%s&app_key=%s&device_id=%s",
	
	detailUrl = "http://i.y.qq.com/v8/playsong.html?songmid=%s",
	SSO_CMD_GetSongInfo =  "sso://ArkAppSvc.QueryMusicInfo",
	SSO_PARA_Search = "fcg_music_search.fcg",
	SSO_PARA_GetSongInfo = "fcg_music_get_song_info_batch.fcg", 
	SSO_PARA_GetRecommend = "fcg_music_get_toplist_info.fcg",
	SSO_PARA_GetStream = "fcg_music_get_playurl.fcg",
}
function MusicData:GetInstance()
    if self.obj then
        return self.obj
    else
        local obj = {}
        setmetatable(obj, self)
        self.__index = self
        
        obj.cacheHelper = utils.CacheHelper:GetInstance()
        obj.netHelper = NetHelper:GetInstance()
        
        self.obj = obj
        return obj
    end
end
          _G['musicplayer'] = {
            MusicPlayer = MusicPlayer,MusicData = MusicData
          }
        `;

  const code$8 = `
          

ViewModel={}

function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(rootView)
    self.root = rootView
    self.view, self.model = self:CreateViewModel(theme.isCurrentInGuildAIO(view))
    
    
    self.view:SetAnchors(15)
    self.view:SetMargin(0,0,0,0)
    self.root:AddChild(self.view)
end

function ViewModel:CreateViewModel(isChannel)
    local view, model
    if isChannel then
        view = CreateView("news_channel")
        model = news_channel.ViewModel:New(self.content)
    else
        view = CreateView("news_base")
        model = news_base.ViewModel:New(self.content)
    end
    model:Initialize(view)
    return view, model
end


function ViewModel:GetModel()
    return self.model
end
          _G['news'] = {
            ViewModel = ViewModel
          }
        `;

  const code$7 = `
          

ViewModel={}

function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(rootView)
    self.root = rootView
    self.view, self.model = self:CreateViewModel(theme.isCurrentInGuildAIO(view))
    
    
    self.view:SetAnchors(15)
    self.view:SetMargin(0,0,0,0)
    self.root:AddChild(self.view)
end

function ViewModel:CreateViewModel(isChannel)
    local view, model
    if isChannel then
        view = CreateView("music_channel")
        model = music_channel.ViewModel:New(self.content)
    else
        view = CreateView("music_base")
        model = music_base.ViewModel:New(self.content)
    end
    model:Initialize(view)
    return view, model
end


function ViewModel:GetModel()
    return self.model
end
          _G['music'] = {
            ViewModel = ViewModel
          }
        `;

  const code$6 = `
          


ViewModel={}


function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(view)
    self.view = view
    self.touch = touch.TouchState:New(view)
    
    self.title = self.view:GetUIObject("title")
    self.desc = self.view:GetUIObject("desc")
    self.preview = self.view:GetUIObject("preview")
    self.bottom = self.view:GetUIObject("bottom")
    self.tag = self.view:GetUIObject("tag")
    self.tagIcon = self.view:GetUIObject("tagIcon")
    self.seperator = self.view:GetUIObject("seperator")
    self.seperatorColor = self.seperator:GetTexture("seperatorColor")

    self.background = self.view:GetUIObject("background")
    self.backgroundChecked = false
    self.background:AttachEvent("OnError", function()
        utils.log("background load failed")
        if self.backgroundChecked == false then
            self.backgroundChecked = true
            utils.UpdateImage(self.background, self.previewUrl, "")
        end
    end)
    
    
    self.baseHeight = 136 --title%E5%8D%95%E8%A1%8C%E6%97%B6%E5%8D%A1%E7%89%87%E5%9B%BA%E5%AE%9A%E9%AB%98%E5%BA%A6
    self.tryUpdateSizeCount = 0
    self.DataInitialized = false
    self.width = 251
    self.height = 136
    self.margin = 16
    self.marginGap = 12

    self.jumpUrl = ""
    
    self.index = utils.ReportIndex.INDEX_NEWS
end

function ViewModel:UpdateStyle()
    utils.log("update style")
    self:UpdateStyleDefault()
    self:ApplyTheme()
end

function ViewModel:UpdateStyleDefault()
    if self.isUpdatingStyle then
        utils.log("update style: ignore")
        return
    end
    self.isUpdatingStyle = true

    local root = self.view:GetRoot()
    
    local width, _ = root:GetSize()
    local height = self.baseHeight
    
    if self.width > 0 then
        width = self.width
    end
    
    local leftContentMargin = 12 
    local rightContentMargin = 12 
    local topContentMargin = 12 
    
    local defPreviewWidth = 52 
    local previewTopMargin = 9 
    
    local previewRightMargin = 12
    
    local descTopMargin = 8 
    local descRightMargin = 8
    local descHeight = 70 
    
    local bottomTopMargin = 5.5 
    local bottomHeight = 17 
    local bottomMarginBottom = 6 
    
    local seperatorMarginTop = 15 
       
    local totalHeight = 0
    local contentWidth = width - leftContentMargin - rightContentMargin
                                
    
    local titleWidth = width - leftContentMargin - rightContentMargin
    self.title:SetFont("app.17");
    self.title:SetSize(titleWidth, 50)
      
    local titleTextWidth, titleTextHeight = self.title:MeasureTextSize()
    local titleHeight = titleTextHeight
    local titleBottom = topContentMargin + titleHeight
    self.title:SetSize(titleWidth, titleHeight)
    self.title:SetMargin(leftContentMargin, topContentMargin, 0, 0)
    
    totalHeight = titleBottom
    local layoutLog = "title-height=" .. titleHeight .. ", top-margin=" .. topContentMargin
    
    
    local previewY = titleBottom + previewTopMargin
    local previewX = width - defPreviewWidth - previewRightMargin
    local previewBottom = previewY + defPreviewWidth
    self.preview:SetSize(defPreviewWidth, defPreviewWidth)
    self.preview:SetMargin(previewX, previewY, 0, 0)
    
                            
    
    local descY = titleBottom + descTopMargin
    local descWidth = titleWidth - defPreviewWidth - descRightMargin
    self.desc:SetFont("app.14")
    self.desc:SetMaxline(3)
    self.desc:SetSize(descWidth, descHeight)
    self.desc:SetMargin(leftContentMargin, descY, 0, 0)
                        
    totalHeight = totalHeight + descTopMargin + descHeight
    layoutLog = layoutLog .. ", desc-height=" .. descHeight .. ", desc-margin=" .. descTopMargin
    
    
    local seperatorY = seperatorMarginTop + previewBottom
    self.seperator:SetVisible(true)
    self.seperator:SetSize(titleWidth, 0.5)
    self.seperator:SetMargin(leftContentMargin, seperatorY, 0, 0)
    totalHeight = seperatorY
                        
    
    local bottomY = seperatorY + bottomTopMargin
    self.bottom:SetSize(contentWidth, bottomHeight)    
    self.bottom:SetMargin(leftContentMargin, bottomY, 0, 0)
    layoutLog = layoutLog .. ", bottom-height=" .. bottomHeight .. ", bottom-margin=" .. bottomTopMargin .. "," .. bottomMarginBottom
    
    
    local tagXOffset = 0
    if self.tagIcon:GetVisible() then
        tagXOffset = 16
    end
    self.tag:SetMargin(tagXOffset, 0, 0, 0)
    
    
    totalHeight = bottomY + bottomHeight + bottomMarginBottom
    
    layoutLog = layoutLog .. ", container-size=" .. width .. "," .. totalHeight
    utils.log("update style:" .. layoutLog)
        
    
    uiutil.SetRootSize(self.view, width, totalHeight)
    
    self.isUpdatingStyle = false
end

function ViewModel:OnResize(width, height)
    utils.log("onResize: size=" .. width .. "," .. height)
    if self.DataInitialized == false then
        
        local inAio = qqutil.IsInAIO(self.view)
        if inAio then
            
            self.width = uiutil.AdjustViewWidth(width)
        else
            self.width = width
        end
        utils.log("update view, inAio=" .. tostring(inAio) 
            .. ", width: " .. width .. "->" .. self.width)
        return
    end
    
    if self.tryUpdateSizeCount > 5 then
        utils.log("onResize: too many resize, resize-count=" .. self.tryUpdateSizeCount)
        return
    end
    
    self.tryUpdateSizeCount = self.tryUpdateSizeCount + 1
    self:UpdateStyle()
end



function ViewModel:OnClick(sender)
    utils.log("news: OnClick")
    utils.loadUrl(self.jumpUrl, self.view:GetRoot())
    utils.report(self.view, self.index, "action.openurl", self.appid)
end

function ViewModel:OnSetMetadata(value)
    utils.log("set meta: " .. Net.TableToJSON(value))
    self.DataInitialized = true
    
    if value and value["news"] then
        local data = value["news"]
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        self.previewUrl = utils.fixurl(data["preview"], self.previewUrl)
        if self.previewUrl ~= nil then
            utils.SetImageValue(self.background, self.previewUrl, "")
        end
        
        self.tagIconUrl = utils.fixurl(data["tagIcon"], self.tagIconUrl)
        if self.tagIconUrl then 
            self.tagIcon:SetVisible(true)
            utils.SetImageValue(self.tagIcon, self.tagIconUrl, "res/images/icon-default.png")
        else
            self.tagIcon:SetVisible(false)
        end
        
        
        utils.setSafeText(self.title,data["title"])
        utils.setSafeText(self.desc,data["desc"])
    end
    
    
    self:UpdateStyle(self.width, self.height)
end

function ViewModel:ApplyTheme()
    local themeConfig = app.getThemeConfig()
    local colorConfig = theme.getThemeColorConfig(self.view)
    
    local texture = self.view:GetTexture("bgColor")
    uiutil.SetColor(texture, colorConfig[theme.THEME_COLOR_BACKGROUND])
    
    
    uiutil.SetColor(self.title, colorConfig[theme.THEME_COLOR_TITLE])
    uiutil.SetColor(self.desc, colorConfig[theme.THEME_COLOR_SUMMARY])
    uiutil.SetColor(self.tag, colorConfig[theme.THEME_COLOR_SOURCE])
    uiutil.SetColor(self.seperatorColor, colorConfig[theme.THEME_COLOR_SEPERATOR])
end

function ViewModel:OnConfigChange(config)
    utils.log("news OnConfigChange appconfig="..Net.TableToJSON(config))
    self:ApplyTheme()
end
          _G['news_base'] = {
            ViewModel = ViewModel
          }
        `;

  const code$5 = `
          

ViewModel={}

BtnType = {
    TYPE_LOADING = 0,
    TYPE_PLAY = 1,
    TYPE_STOP = 2
}

function ViewModel:New(view)
    local obj = {}
    setmetatable(obj,self)
    self.__index=self
    return obj
end

function ViewModel:delayUpdatePlayButton(btn, image)
    if self.imageUpdateTimer == nil then
        self.imageUpdateTimer = Timer()
        self.imageUpdateTimer:SetInterval(100)
    else
        self.imageUpdateTimer:Stop()
        self.imageUpdateTimer:DetachEvent("OnTimer")
    end

    self.imageUpdateTimer:AttachEvent("OnTimer", function()
        self:SetIcon(btn, image)
        self.imageUpdateTimer:Stop()
    end)

    self.imageUpdateTimer:Start()
end

function ViewModel:imageTypeToImage(imageType)
    if imageType == BtnType.TYPE_LOADING then
        return self.loadingImage, self.loadingWidth, self.loadingWidth
    elseif imageType == BtnType.TYPE_PLAY then
        return self.playImage, 24, 24
    elseif imageType == BtnType.TYPE_STOP then
        return self.stopImage, 24, 24
    end

    return self.playImage
end

function ViewModel:SetIcon(view, imageType)
    if view == nil then
        utils.log("canvas is nil")
        return
    end

    utils.log("music: SetIcon, type=" .. tostring(imageType))


    local canvas = view
    local w, h = canvas:GetSize()

    if self.loadingTimer ~= nil then
        self.loadingTimer:Stop()
        self.loadingTimer:DetachEvent("OnTimer")
    end

    local image, iconWidth, iconHeight = self:imageTypeToImage(imageType)

    if imageType ~= BtnType.TYPE_LOADING then
        local left = w / 2 - iconWidth / 2
        local top = h / 2 - iconHeight / 2

        
        canvas:ClearRect(0, 0, w, h)
        canvas:Save()

        
        

        canvas:SetDrawStyle(0x4FFFFFFF)
        canvas:DrawCircle(w/2, h/2, 12)

        canvas:Restore()
    else
        if self.loadingTimer == nil then
            self.loadingTimer= Timer()
            self.loadingTimer:SetInterval(50)
        end
        local angle = 0
        self.loadingTimer:AttachEvent("OnTimer", function()
            angle = angle + 10
            if angle > 360 then
                angle = angle - 360
            end
            canvas:Clear()
            canvas:Save()
            canvas:Translate(w/2, h/2)
            
            
            
            canvas:Restore()

            local pos = self.musicPlayer:GetProcess()
            if pos > 0 then
                self:SetIcon(view, BtnType.TYPE_STOP)
            end
        end)
        self.loadingTimer:Start()
    end
end

function ViewModel:Initialize(view)
    self.width, self.height = view:GetSize()
    self.margin = 16
    self.marginGap = 12
    self.marginBottom = 7.5
    self.loadingWidth = 24
    self.index = utils.ReportIndex.INDEX_MUSIC

    self.view = view
    self.touch=touch.TouchState:New(view)
    self.titleView = self.view:GetUIObject("title")
    self.descView = self.view:GetUIObject("desc")
    self.preview = self.view:GetUIObject("preview")
    self.bottom = self.view:GetUIObject("bottom")
    self.iconAnime = self.view:GetUIObject("iconAnime")
    self.seperator = self.view:GetUIObject("seperator")

    self.background = self.view:GetUIObject("background")
    self.backgroundChecked = false
    self.background:AttachEvent("OnError", function()
        if self.backgroundChecked == false then
            self.backgroundChecked = true
            utils.UpdateImage(self.background, self.previewUrl, "")
        end
    end)
    self.tag = self.view:GetUIObject("tag")
    self.tagIcon = self.view:GetUIObject("tagIcon")

    self.playImage = UI:Image()
    self.playImage:SetStretch(2)
    self.playImage:SetValue("res/images/play_music.png")

    self.stopImage = UI:Image()
    self.stopImage:SetStretch(2)
    self.stopImage:SetValue("res/images/pause_music.png")

    self.loadingImage = UI:Image()
    self.loadingImage:SetStretch(2)
    self.loadingImage:SetValue("res/images/loading.png")

    self.imageUpdateTimer = nil
    self.loadingTimer = nil

    
    self.playing = false
    self.musicPlayer = musicplayer.MusicPlayer:GetInstance()
    self.musicPlayer:AddListener(self, function(state, seq,musicUrl)
        utils.log("init musicTest state:"..tostring(state))
        if state == musicplayer.MusicPlayer.STATE_STOP then
            self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_PLAY)
        elseif state == musicplayer.MusicPlayer.STATE_PLAYING then
            utils.log("init musicTest self.musicUrl:"..tostring(self.musicUrl).." musicUrl:"..tostring(musicUrl))
            if tostring(self.musicUrl) == tostring(musicUrl) then
                self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_LOADING)
            end
        elseif state == musicplayer.MusicPlayer.STATE_PAUSE then
            
            utils.log("play state pause")
        else
            utils.log("other state")
        end
    end)

    self.musicPlayer:UpdatePlayingState()
end

function ViewModel:UpdateStyle(width, height)

    if self.isUpdatingStyle then
        utils.log("music: update style in progress")
        return
    end
    self.isUpdatingStyle = true
    utils.log("music: update style, size=" .. width .. "," .. height)

    uiutil.SetRootSize(self.view, width, height)

    utils.setBackground(self.view, app.getThemeConfig())

    self.isUpdatingStyle = false
end

function ViewModel:OnResize(width, height)

    if not self.hasSetMetaData then
        local inAio = qqutil.IsInAIO(self.view) or true
        if inAio then
            
            self.width = uiutil.AdjustViewWidth(width)
        else
            self.width = width
        end
        utils.log("music: update size, " .. width .. "," .. height ..
            "->" .. self.width .. "," .. self.height .. ", in-aio=" .. tostring(inAio))
        return
    end
    utils.log("music: OnResize: in-size=" .. width .. "," .. height
        .. ", new-size=" .. self.width .. "," .. self.height)

    self:UpdateStyle(self.width, self.height)
end

function ViewModel:OnTouchStart(sender, click)
    local showPressState = true
    if click ~= nil then
        local l, t, r, b = self.background:GetRootRect()
        local x = click.targetTouches[1].clientX
        local y = click.targetTouches[1].clientY
        if x > l and x < r and y > t and y < b then
            showPressState = false
        end
    end
    if showPressState == true then
    
        touch.OnTouchStart(sender, click)
    end
end

function ViewModel:OnClick(sender)
    local id = sender:GetID()
    if id == "music" or sender == sender:GetRoot() then
        self.musicPlayer:Stop()
        utils.loadUrl(self.jumpUrl, self.view:GetRoot())
        return
    end

    if id == "preview" then
        local state, seq, musicUrl = self.musicPlayer:GetState()
        local play = false
        if tostring(musicUrl) ~= tostring(self.musicUrl) then
            self.musicPlayer:Stop()
            play = true
        else
            if state == musicplayer.MusicPlayer.STATE_STOP or state == musicplayer.MusicPlayer.STATE_PAUSE then
                play = true
            end
        end
        if play == true then
            self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_LOADING)
            
            self.musicPlayer:Play(self.musicUrl, self.jumpUrl, self.title, self.desc, 1)
        else
            self.musicPlayer:Stop()
        end
    end
end

function ViewModel:OnSetMetadata(value)
    self.hasSetMetaData = true
    utils.log("music: OnSetMetadata")

    if value and value["music"] then
        local data = value["music"]
        self.iconUrl = utils.fixurl(data["tagIcon"], self.iconUrl)
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        self.musicUrl = utils.fixurl(data["musicUrl"], self.jumpUrl)
        self.previewUrl = utils.fixurl(data["preview"], self.previewUrl)
        self.title,_find = utils.getSafeUtf8String(data["title"])
        self.desc,_find = utils.getSafeUtf8String(data["desc"])

        
        utils.setSafeText(self.titleView,data["title"])
        utils.setSafeText(self.descView,data["desc"])

        
        if self.previewUrl ~= nil then
            utils.SetImageValue(self.background, self.previewUrl, "")
        end

        if self.iconUrl then
            self.tagIcon:SetVisible(true)
            utils.SetImageValue(self.tagIcon, self.iconUrl, "res/images/icon-default.png")
        else
            self.tagIcon:SetVisible(false)
        end

        local state, seq, musicUrl = self.musicPlayer:GetState()
        if self.musicUrl ~= nil and musicUrl ~= nil then
            if state == musicplayer.MusicPlayer.STATE_STOP then
                self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_PLAY)
            elseif state == musicplayer.MusicPlayer.STATE_PLAYING then
                utils.log("meta musicTest self.musicUrl:"..tostring(self.musicUrl).." musicUrl:"..tostring(musicUrl))
                if tostring(self.musicUrl) == tostring(musicUrl) then
                    self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_LOADING)
                end
            end
        else
            self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_PLAY)
        end

        self.appid = data["appid"]
    end

    self:UpdateStyle(self.width, self.height)
end

function ViewModel:OnConfigChange(config)
    Console.Log("music OnConfigChange appconfig="..Net.TableToJSON(config))
    utils.setBackground(self.view, app.getThemeConfig())
end

          _G['music_base'] = {
            ViewModel = ViewModel,BtnType = BtnType
          }
        `;

  const code$4 = `
          ViewModel={}


function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(view)
    self.view = view
    self.touch = touch.TouchState:New(view)
    self.title = self.view:GetUIObject("title")
    self.desc = self.view:GetUIObject("desc")
    self.preview = self.view:GetUIObject("preview")
    self.bottom = self.view:GetUIObject("bottom")
    self.tag = self.view:GetUIObject("tag")

    self.background = self.view:GetUIObject("background")
    self.backgroundChecked = false
    self.background:AttachEvent("OnError", function()
        app.debug("background load failed")
        if self.backgroundChecked == false then
            self.backgroundChecked = true
            utils.UpdateImage(self.background, self.previewUrl, "res/images/default.png")
        end
    end)
    
    self.baseHeight = 136 
    self.tryUpdateSizeCount = 0
    self.DataInitialized = false
    self.width = 251
    self.height = 136
    self.margin = 16
    self.marginGap = 12

    
    self.jumpUrl = "http://qq.com"
    
    self.index = utils.ReportIndex.INDEX_NEWS
    self.titleLineNum = 1
end

function ViewModel:UpdateStyle()
    QQ.Log("update style")
    if not theme.isCurrentInGuildAIO(self.view:GetRoot()) then
        self:UpdateStyleDefault()
    else
        self:UpdateStyleChannel()
    end
    utils.setBackground(self.view, app.themeConfig)
end


function ViewModel:UpdateStyleDefault()
    local root = self.view:GetRoot()
    local width, _ = root:GetSize()
    local height = self.baseHeight
    
    
    local titleWidth, titleHeight = self.title:GetSize()
    self.title:SetSize(titleWidth, 50)
    local titleTextWidth, titleTextHeight = self.title:MeasureTextSize()
    local newTitleWidth = width - self.margin * 2
    if titleTextHeight > 25 and self.titleLineNum == 1 then  
        self.titleLineNum = 2
        height = height + 18
        if utils.isIOS() then
            height = height + 8
        end

        self.view:SetSize(width, height)
    elseif self.titleLineNum == 1 then  
        self.view:SetSize(width, height)
    end

    self.title:SetSize(newTitleWidth, titleTextHeight + utils.getFontHeightDelta(17))

    
    local w, h = self.bottom:GetSize()
    local l,t,r,b = self.bottom:GetMargin()
    self.bottom:SetSize(width, h)    
    local bottomTop = height - h
    self.bottom:SetMargin(l, bottomTop, r, b)
    
    
    local previewWidth, previewHeight = self.preview:GetSize()
    local l,t,r,b = self.preview:GetMargin()
    local previewTop = self.margin + titleTextHeight + self.marginGap / 2
    self.preview:SetMargin(width - self.margin - previewWidth, 
                           previewTop,
                           r,
                           b)

    
    local w, h = self.desc:GetSize()
    local l,t,r,b = self.desc:GetMargin()
    self.desc:SetSize(width - self.marginGap / 2 - self.margin * 2 - previewWidth, 
                      bottomTop - self.margin - self.marginGap / 2 - titleTextHeight)
    self.desc:SetMargin(l, 
                        previewTop, 
                        r, 
                        b)
    
end

function ViewModel:UpdateStyleChannel() 

    if self.isUpdatingStyle then
        utils.log("update style: ignore")
        return
    end

    self.isUpdatingStyle = true

    local root = self.view:GetRoot()
    local width, _ = root:GetSize()
    local height = self.baseHeight
    
    local leftContentMargin = 16 
    local rightContentMargin = 12 
    local topContentMargin = 11
    local bottomContentMargin = 12
    
    local defPreviewWidth = 64
    local previewTopMargin = 12
    local previewLeftMargin = 12
    local previewRightMargin = 12
    
    local descTopMargin = 5
    local descHeight = 34
    if utils.isIOS() then
        
        descHeight = descHeight + 8
    end
    
    local bottomTopMargin = 12
    local bottomHeight = 12
    
    local totalHeight = 0
    
    
    self.preview:SetSize(defPreviewWidth, defPreviewWidth)
    self.preview:SetMargin(width - defPreviewWidth - previewRightMargin, 
                            previewTopMargin,
                            0,
                            0)
                            
    
    local titleWidth = width - leftContentMargin - rightContentMargin - defPreviewWidth - previewLeftMargin
    self.title:SetFont("app.16.bold");
    self.title:SetSize(titleWidth, 50)
    
    local titleTextWidth, titleTextHeight = self.title:MeasureTextSize()
    if titleTextHeight > 25 and self.titleLineNum == 1 then  
        self.titleLineNum = 2
        if utils.isIOS() then
            titleTextHeight = titleTextHeight + 8
        end
    elseif self.titleLineNum == 1 then  
    end
    
    local titleHeight = titleTextHeight
    self.title:SetSize(titleWidth, titleHeight)
    self.title:SetMargin(leftContentMargin, topContentMargin, 0, 0)

    totalHeight = topContentMargin + titleHeight
    
    local layoutLog = "title-height=" .. titleHeight .. ", top-margin=" .. topContentMargin

    
    self.desc:SetFont("app.14")
    self.desc:SetMaxline(2)
    self.desc:SetSize(titleWidth, descHeight)
    self.desc:SetMargin(leftContentMargin, 
                        totalHeight + descTopMargin, 
                        0, 
                        0)
                        
    totalHeight = totalHeight + descTopMargin + descHeight
    
    layoutLog = layoutLog .. ", desc-height=" .. descHeight .. ", desc-margin=" .. descTopMargin
                        
    
    self.bottom:SetSize(width, bottomHeight)    
    self.bottom:SetMargin(leftContentMargin, totalHeight + bottomTopMargin, 0, 0)
    
    self.tag:SetMargin(0, 0, 0, 0)
    self.tag:SetFont("app.12")
    
    layoutLog = layoutLog .. ", bottom-height=" .. bottomHeight .. ", bottom-margin=" .. bottomTopMargin .. "," .. bottomContentMargin

    
    local totalHeight = totalHeight + bottomTopMargin + bottomHeight + bottomContentMargin

    layoutLog = layoutLog .. ", container-size=" .. width .. "," .. totalHeight
    utils.log("update style:" .. layoutLog)
        
    root:SetSize(width, totalHeight)   
    
    self.isUpdatingStyle = false
end

function ViewModel:OnResize(width, height)
    utils.log("onResize: size=" .. width .. "," .. height)
    if self.DataInitialized == false or self.tryUpdateSizeCount > 5 then
        return
    end
    
    self.tryUpdateSizeCount = self.tryUpdateSizeCount + 1
    self:UpdateStyle()
end



function ViewModel:OnClick(sender)
	utils.loadUrl(self.jumpUrl, self.view:GetRoot())
    utils.report(self.view, self.index, "action.openurl", self.appid)
end

function ViewModel:OnSetMetadata(value)
    if value and value["news"] then
        local data = value["news"]
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        self.previewUrl = utils.fixurl(data["preview"], self.previewUrl)
        if self.previewUrl ~= nil then
            utils.SetImageValue(self.background, self.previewUrl, "res/images/default.png")
        end
        
        
        utils.setSafeText(self.title,data["title"])
        utils.setSafeText(self.desc,data["desc"])
        
        self.appid = data["appid"]
        utils.report(self.view, self.index, "action.setmetatable", self.appid)
    end
    self.DataInitialized = true
    
    self.titleLineNum = 1
    self:UpdateStyle(self.width, self.height)
end

function ViewModel:OnConfigChange(config)
    Console.Log("news OnConfigChange appconfig="..Net.TableToJSON(config))
    utils.setBackground(self.view, config)
end 

function ViewModel:OnStartup(config)
    Console.Log("news OnStartup appconfig="..Net.TableToJSON(config))
end
          _G['news_channel'] = {
            ViewModel = ViewModel
          }
        `;

  const code$3 = `
          ViewModel={}

BtnType = {
    TYPE_LOADING = 0,
    TYPE_PLAY = 1,
    TYPE_STOP = 2
}

function ViewModel:New(view)
    local obj = {}
    setmetatable(obj,self)
    self.__index=self
    return obj
end

function ViewModel:delayUpdatePlayButton(btn, image)
    if self.imageUpdateTimer == nil then
        self.imageUpdateTimer = Timer()
        self.imageUpdateTimer:SetInterval(100)
    else
        self.imageUpdateTimer:Stop()
        self.imageUpdateTimer:DetachEvent("OnTimer")
    end

    self.imageUpdateTimer:AttachEvent("OnTimer", function()
        self:SetIcon(btn, image)
        self.imageUpdateTimer:Stop()
    end)

    self.imageUpdateTimer:Start()
end

function ViewModel:imageTypeToImage(imageType)
    if imageType == BtnType.TYPE_LOADING then
        return self.loadingImage
    elseif imageType == BtnType.TYPE_PLAY then
        return self.playImage
    elseif imageType == BtnType.TYPE_STOP then
        return self.stopImage
    end

    return self.playImage
end

function ViewModel:SetIcon(view, imageType)
    if view == nil then
        app.log("canvas is nil")
        return
    end
    local canvas = view
    local w, h = canvas:GetSize()

    if self.loadingTimer ~= nil then
        self.loadingTimer:Stop()
        self.loadingTimer:DetachEvent("OnTimer")
    end
    local image = self:imageTypeToImage(imageType)
    if imageType ~= BtnType.TYPE_LOADING then
        local left = w / 2 - self.playBtnWidth / 2
        local top = h / 2 - self.playBtnWidth / 2

        
        canvas:ClearRect(0, 0, w, h)
        canvas:Save()
        canvas:DrawImage(image, left, top, self.playBtnWidth, self.playBtnWidth)
        canvas:Restore()
    else
        if self.loadingTimer == nil then
            self.loadingTimer= Timer()
            self.loadingTimer:SetInterval(50)
        end
        local angle = 0
        self.loadingTimer:AttachEvent("OnTimer", function()
            angle = angle + 10
            if angle > 360 then angle = angle -360 end
            canvas:Clear()
            canvas:Save()
            canvas:Translate(w/2, h/2)
            canvas:Rotate(math.rad(angle))
            canvas:DrawImage(image, -self.loadingWidth /2, -self.loadingWidth /2, self.loadingWidth, self.loadingWidth)
            canvas:Restore()

            local pos = self.musicPlayer:GetProcess()
            if pos > 0 then
                self:SetIcon(view, BtnType.TYPE_STOP)
            end
        end)
        self.loadingTimer:Start()
    end
end

function ViewModel:Initialize(view)
    self.width = 251
    self.height = 139.25
    self.margin = 16
    self.marginGap = 12
    self.marginBottom = 7.5
    self.loadingWidth = 35
    self.playBtnWidth = 12.5
    self.index = utils.ReportIndex.INDEX_MUSIC

    self.view = view
    self.touch=touch.TouchState:New(view)
    self.titleView = self.view:GetUIObject("title")
    self.descView = self.view:GetUIObject("desc")
    self.preview = self.view:GetUIObject("preview")
    self.bottom = self.view:GetUIObject("bottom")
    self.iconAnime = self.view:GetUIObject("iconAnime")

    self.background = self.view:GetUIObject("background")
    self.backgroundChecked = false
    self.background:AttachEvent("OnError", function()
        if self.backgroundChecked == false then
            self.backgroundChecked = true
            utils.UpdateImage(self.background, self.previewUrl, "res/images/default.png")
        end
    end)
    self.tag = self.view:GetUIObject("tag")

    

    self.playImage = UI:Image()
    self.playImage:SetStretch(2)
    self.playImage:SetValue("res/images/play.png")

    self.stopImage = UI:Image()
    self.stopImage:SetStretch(2)
    self.stopImage:SetValue("res/images/stop.png")

    self.loadingImage = UI:Image()
    self.loadingImage:SetStretch(2)
    self.loadingImage:SetValue("res/images/loading.png")

    self.imageUpdateTimer = nil
    self.loadingTimer = nil

    
    self.playing = false
    self.musicPlayer = musicplayer.MusicPlayer:GetInstance()
    self.musicPlayer:AddListener(self, function(state, seq,musicUrl)
        app.log("init musicTest state:"..tostring(state))
        if state == musicplayer.MusicPlayer.STATE_STOP then
            self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_PLAY)
        elseif state == musicplayer.MusicPlayer.STATE_PLAYING then
            app.log("init musicTest self.musicUrl:"..tostring(self.musicUrl).." musicUrl:"..tostring(musicUrl))
            if tostring(self.musicUrl) == tostring(musicUrl) then
                self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_LOADING)
            end
        elseif state == musicplayer.MusicPlayer.STATE_PAUSE then
            
            app.log("play state pause")
        else
            app.log("other state")
        end
    end)
    
    self.musicPlayer:UpdatePlayingState()
end

function ViewModel:UpdateStyle(width, height)
    if not theme.isCurrentInGuildAIO(self.view:GetRoot()) then
        self:UpdateStyleDefault()
    else
        self:UpdateStyleChannel()
    end
    utils.setBackground(self.view, app.themeConfig)
end

function ViewModel:UpdateStyleDefault(width, height)
    local root = self.view:GetRoot()
    local width, height = root:GetSize()

    
    local previewWidth, previewHeight = self.preview:GetSize()
    local l,t,r,b = self.preview:GetMargin()
    local previewLeft = width - self.margin - previewWidth
    self.preview:SetMargin(previewLeft,
                           t,
                           r,
                           b)

    
    self:SetIcon(self.iconAnime, BtnType.TYPE_PLAY)

    
    local titleWidth, titleHeight = self.titleView:GetSize()
    self.titleView:SetSize(titleWidth, 50)
    local titleTextWidth, titleTextHeight = self.titleView:MeasureTextSize()
    local newTitleWidth = width - self.margin * 2 - self.marginGap - previewWidth
    self.titleView:SetSize(newTitleWidth, titleTextHeight + utils.getFontHeightDelta(17))
    
    
    local w, h = self.bottom:GetSize()
    local l,t,r,b = self.bottom:GetMargin()
    self.bottom:SetSize(width, h)    
    local bottomTop = height - h
    self.bottom:SetMargin(l, bottomTop, r, b)
    
    
    local w, h = self.descView:GetSize()
    local l,t,r,b = self.descView:GetMargin()
    self.descView:SetSize(width - self.marginGap - self.margin * 2 - previewWidth, 
                      bottomTop - self.margin * 2 - titleTextHeight)
    local descTop = self.margin  + titleTextHeight + self.marginGap / 2
    self.descView:SetMargin(l, 
                        descTop, 
                        r, 
                        b)
end

function ViewModel:UpdateStyleChannel(width, height)
    local root = self.view:GetRoot()
    local width, height = root:GetSize()
    
    local leftContentMargin = 16 
    local rightContentMargin = 12 
    local topContentMargin = 11
    local bottomContentMargin = 12
    
    local defPreviewWidth = 64
    local previewTopMargin = 12
    local previewLeftMargin = 12
    local previewRightMargin = 12
    
    local descTopMargin = 5
    local descHeight = 34
    
    local bottomTopMargin = 12
    local bottomHeight = 12
    
    local totalHeight = 0
    
    local titleHeight = 18
    

    
    self.preview:SetSize(defPreviewWidth, defPreviewWidth)
    self.preview:SetMargin(width - rightContentMargin - defPreviewWidth,
                           previewTopMargin,
                           0,
                           0)
    
    self:SetIcon(self.iconAnime, BtnType.TYPE_PLAY)
    self.background:SetRadius(4,4,4,4)


    
    local titleWidth = width - leftContentMargin - rightContentMargin - defPreviewWidth - previewLeftMargin
    self.titleView:SetFont("app.16.bold")
    self.titleView:SetSize(titleWidth, 50)
    local titleTextWidth, titleTextHeight = self.titleView:MeasureTextSize()

    local titleHeight = titleTextHeight + utils.getFontHeightDelta(17)
    self.titleView:SetSize(titleWidth, titleHeight)
    self.titleView:SetMargin(leftContentMargin, topContentMargin, 0, 0)
    
    totalHeight = titleHeight + topContentMargin
    
    
    local descWidth = titleWidth
    local descHeight = 34
    self.descView:SetFont("app.14")
    self.descView:SetSize(descWidth, descHeight)
    self.descView:SetMargin(leftContentMargin, 
                        totalHeight + descTopMargin, 
                        0, 
                        0)
                        
    totalHeight = totalHeight + descTopMargin + descHeight
    
    
    self.bottom:SetSize(width, bottomHeight)    
    self.bottom:SetMargin(leftContentMargin, 
                          totalHeight + bottomTopMargin, 
                          0, 
                          0)
    self.tag:SetMargin(0,0,0,0)
    self.tag:SetFont("app.12")
    
                          
    totalHeight = totalHeight + bottomHeight + bottomTopMargin + bottomContentMargin

    
    root:SetSize(width, totalHeight)

end

function ViewModel:OnResize(width, height)
    self.width = width
    self.height = height
    self:UpdateStyle(self.width, self.height)
end

function ViewModel:OnTouchStart(sender, click)
    local showPressState = true
    if click ~= nil then
        local l, t, r, b = self.background:GetRootRect()
        local x = click.targetTouches[1].clientX
        local y = click.targetTouches[1].clientY
        if x > l and x < r and y > t and y < b then
            showPressState = false
        end
    end
    if showPressState == true then
    
        touch.OnTouchStart(sender, click)
    end
end

function ViewModel:OnClick(sender)
    local id = sender:GetID()
    if id == "music" or sender == sender:GetRoot() then
        self.musicPlayer:Stop()
        utils.loadUrl(self.jumpUrl, self.view:GetRoot())
        utils.report(self.view, self.index, "action.openurl", self.appid)
        return
    end

    if id == "preview" then
        local state, seq, musicUrl = self.musicPlayer:GetState()
        local play = false
        if tostring(musicUrl) ~= tostring(self.musicUrl) then
            self.musicPlayer:Stop()
            play = true
        else
            if state == musicplayer.MusicPlayer.STATE_STOP or state == musicplayer.MusicPlayer.STATE_PAUSE then
                play = true
            end
        end
        if play == true then
            utils.report(self.view, self.index, "action.playmusic", self.appid)
            self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_LOADING)
            
            self.musicPlayer:Play(self.musicUrl, self.jumpUrl, self.title, self.desc, 1)
        else
            self.musicPlayer:Stop()
        end
    end
end

function ViewModel:UpdateUrl(url, callback)

self:UpdateStyle(self.width, self.height)

end

function ViewModel:OnSetMetadata(value)
    if value and value["music"] then
        local data = value["music"]
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        self.musicUrl = utils.fixurl(data["musicUrl"], self.jumpUrl)
        self.previewUrl = utils.fixurl(data["preview"], self.previewUrl)
        
        self:UpdateUrl(self.musicUrl, function(url)
            if url ~= nil then
                self.musicUrl = url
             end
        end)
        
        self.title,_find = utils.getSafeUtf8String(data["title"])
        self.desc,_find = utils.getSafeUtf8String(data["desc"])
        
        
        utils.setSafeText(self.titleView,data["title"])
        utils.setSafeText(self.descView,data["desc"])

        
        if self.previewUrl ~= nil then
            utils.SetImageValue(self.background, self.previewUrl, "res/images/default.png")
        end
        
    
        local state, seq, musicUrl = self.musicPlayer:GetState()
        if self.musicUrl ~= nil and musicUrl ~= nil then
            if state == musicplayer.MusicPlayer.STATE_STOP then
                self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_PLAY)
            elseif state == musicplayer.MusicPlayer.STATE_PLAYING then
                app.log("meta musicTest self.musicUrl:"..tostring(self.musicUrl).." musicUrl:"..tostring(musicUrl))
                if tostring(self.musicUrl) == tostring(musicUrl) then
                    self:delayUpdatePlayButton(self.iconAnime, BtnType.TYPE_LOADING)
                end
            end
        end
        
        self.appid = data["appid"]
        utils.report(self.view, utils.ReportIndex.INDEX_MUSIC, "action.setmetatable", self.appid)
 
    end
    utils.asyncCallback(1, function()
        self:UpdateStyle(self.width, self.height)
    end)
end

function ViewModel:OnConfigChange(config)
    Console.Log("music OnConfigChange appconfig="..Net.TableToJSON(config))
    utils.setBackground(self.view, config)
end 

function ViewModel:OnStartup(config)
    Console.Log("music OnStartup appconfig="..Net.TableToJSON(config))
end
          _G['music_channel'] = {
            ViewModel = ViewModel,BtnType = BtnType
          }
        `;

  const code$2 = `
          ViewModel={}

function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(view)
    self.view = view
    self.touch = touch.TouchState:New(view)
    self.title = self.view:GetUIObject("title")
    self.desc = self.view:GetUIObject("desc")
    self.preview = self.view:GetUIObject("preview")
    self.playBtn = self.view:GetUIObject("playBtn")
    self.bottom = self.view:GetUIObject("bottom")
    self.tag = self.view:GetUIObject("tag")

    self.background = self.view:GetUIObject("background")
    self.backgroundChecked = false
    self.background:AttachEvent("OnError", function()
        app.debug("background load failed")
        if self.backgroundChecked == false then
            self.backgroundChecked = true
            utils.UpdateImage(self.background, self.previewUrl, "res/images/default.png")
        end
    end)
    self.baseHeight = 142 
    self.tryUpdateSizeCount = 0
    self.DataInitialized = false
    self.width = 251
    self.height = 139.25
    self.margin = 16
    self.marginGap = 12
    self.titleLineNum = 1

    
    self.jumpUrl = "http://qq.com"

    self.index = utils.ReportIndex.INDEX_VIDEO
end

function ViewModel:UpdateStyle()
    QQ.Log("update style")
    if not theme.isCurrentInGuildAIO(self.view:GetRoot()) then
        self:UpdateStyleDefault()
    else
        self:UpdateStyleChannel()
    end
    utils.setBackground(self.view, app.themeConfig)
end

function ViewModel:UpdateStyleDefault(width, height)
    local root = self.view:GetRoot()
    local width, _ = root:GetSize()
    local height = self.baseHeight

    
    local titleWidth, titleHeight = self.title:GetSize()
    self.title:SetSize(titleWidth, 50)
    local titleTextWidth, titleTextHeight = self.title:MeasureTextSize()
    local newTitleWidth = width - self.margin * 2

    if titleTextHeight > 25 and self.titleLineNum == 1 then 
        self.titleLineNum = 2
        height = height + 18
        if utils.isIOS() then
            height = height + 8
        end

        self.view:SetSize(width, height)
    elseif self.titleLineNum == 1 then 
        self.view:SetSize(width, height)
    end

    self.title:SetSize(newTitleWidth, titleTextHeight + utils.getFontHeightDelta(17))

    
    local w, h = self.bottom:GetSize()
    local l,t,r,b = self.bottom:GetMargin()
    self.bottom:SetSize(width, h)
    local bottomTop = height - h
    self.bottom:SetMargin(l, bottomTop, r, b)

    
    local previewWidth, previewHeight = self.preview:GetSize()
    local l,t,r,b = self.preview:GetMargin()
    local previewTop = self.margin + titleTextHeight + self.marginGap / 2
    self.preview:SetMargin(width - self.margin - previewWidth,
                           previewTop,
                           r,
                           b)

    
    if self.index == utils.ReportIndex.INDEX_VIDEO then
        self.playBtn:SetVisible(true)
        local w, h = self.preview:GetSize()
        local btnW, btnH = self.playBtn:GetSize()
        local l,t,r,b = self.playBtn:GetMargin()
        self.playBtn:SetMargin(w / 2 - btnW /2,
                               h / 2 - btnH / 2,
                               r,
                               b)
    end

    
    local w, h = self.desc:GetSize()
    local l,t,r,b = self.desc:GetMargin()
    self.desc:SetSize(width - self.marginGap / 2 - self.margin * 2 - previewWidth,
                      bottomTop - self.margin * 2 - titleHeight)
    self.desc:SetMargin(l,
                        previewTop,
                        r,
                        b)
end


function ViewModel:UpdateStyleChannel(width, height)
    local root = self.view:GetRoot()
    local width, _ = root:GetSize()
    local height = self.baseHeight


    local leftContentMargin = 16 
    local rightContentMargin = 12 
    local topContentMargin = 11
    local bottomContentMargin = 12

    local defPreviewWidth = 64
    local previewTopMargin = 12
    local previewLeftMargin = 12
    local previewRightMargin = 12

    local descTopMargin = 5
    local descHeight = 34

    local bottomTopMargin = 12
    local bottomHeight = 12

    local totalHeight = 0

    local titleHeight = 18


    
    self.preview:SetSize(defPreviewWidth, defPreviewWidth)
    self.preview:SetMargin(width - rightContentMargin - defPreviewWidth,
                           previewTopMargin,
                           0,
                           0)

    self:UpdatePlayButton()


    
    local titleWidth = width - leftContentMargin - rightContentMargin - defPreviewWidth - previewLeftMargin
    self.title:SetFont("app.16.bold")
    self.title:SetSize(titleWidth, 50)

    local titleTextWidth, titleTextHeight = self.title:MeasureTextSize()
    if titleTextHeight > 25 and self.titleLineNum == 1 then 
        self.titleLineNum = 2
        height = height + 18
        if utils.isIOS() then
            height = height + 8
        end
    elseif self.titleLineNum == 1 then 
    end

    local titleHeight = titleTextHeight
    self.title:SetSize(titleTextWidth, titleHeight)
    self.title:SetMargin(leftContentMargin, topContentMargin, 0, 0)

    totalHeight = topContentMargin + titleHeight

    
    self.desc:SetFont("app.14")
    self.desc:SetMaxline(2)
    self.desc:SetSize(titleWidth, descHeight)
    self.desc:SetMargin(leftContentMargin,
                        totalHeight + descTopMargin,
                        0,
                        0)

    totalHeight = totalHeight + descTopMargin + descHeight

    
    self.bottom:SetSize(width, bottomHeight)
    self.bottom:SetMargin(leftContentMargin,
                          totalHeight + bottomTopMargin,
                          0,
                          0)
    self.tag:SetFont("app.12")
    self.tag:SetMargin(0, 0, 0, 0)


    
    local totalHeight = totalHeight + bottomTopMargin + bottomHeight + bottomContentMargin
    root:SetSize(width, totalHeight)

end

function ViewModel:UpdatePlayButton()
    
    if self.index == utils.ReportIndex.INDEX_VIDEO then
        self.playBtn:SetVisible(true)
        local w, h = self.preview:GetSize()
        local btnW, btnH = self.playBtn:GetSize()
        local l,t,r,b = self.playBtn:GetMargin()
        self.playBtn:SetMargin(w / 2 - btnW /2,
                               h / 2 - btnH / 2,
                               r,
                               b)
    end
end

function ViewModel:OnResize(width, height)
    if self.DataInitialized == false or self.tryUpdateSizeCount > 5 then
        return
    end
    self.tryUpdateSizeCount = self.tryUpdateSizeCount + 1
    self:UpdateStyle()
end


function ViewModel:OnClick(sender)
	local id = sender:GetID()
    if sender == sender:GetRoot() then
        utils.loadUrl(self.jumpUrl, self.view:GetRoot())
        utils.report(self.view, self.index, "action.openurl", self.appid)
        return
    end
end

function ViewModel:SetReportIndex(index)
    self.index = index
end

function ViewModel:OnSetMetadata(value)
	if value and value["video"] then
        local data = value["video"]
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        self.previewUrl = utils.fixurl(data["preview"], self.previewUrl)
        if self.previewUrl ~= nil then
            utils.SetImageValue(self.background, self.previewUrl, "res/images/default.png")
        end
        
        utils.setSafeText(self.title,data["title"])
        utils.setSafeText(self.desc,data["desc"])

        self.appid = data["appid"]
        utils.report(self.view, self.index, "action.setmetatable", self.appid)
    end

    self.DataInitialized = true
    self:UpdateStyle()
end

function ViewModel:OnConfigChange(config)
    Console.Log("video OnConfigChange appconfig="..Net.TableToJSON(config))
    utils.setBackground(self.view, config)
end

function ViewModel:OnStartup(config)
    Console.Log("video OnStartup appconfig="..Net.TableToJSON(config))
end

          _G['video'] = {
            ViewModel = ViewModel
          }
        `;

  const code$1 = `
          ViewModel={}

function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(view)
    self.view = view
    self.touch=touch.TouchState:New(view)
    self.titleView = self.view:GetUIObject("title")
    self.descView = self.view:GetUIObject("desc")
    self.preview = self.view:GetUIObject("preview")
    self.bottom = self.view:GetUIObject("bottom")

    self.background = self.view:GetUIObject("background")
    self.backgroundChecked = false
    self.background:AttachEvent("OnError", function()
        app.debug("background load failed")
        if self.backgroundChecked == false then
            self.backgroundChecked = true
            utils.UpdateImage(self.background, self.previewUrl, "res/images/default.png")
        end
    end)

    self.width = 251
    self.height = 139.25
    self.margin = 16
    self.marginGap = 12
    self.marginBottom = 7.5
    
    self.index = utils.ReportIndex.INDEX_CONTACT
    
end

function ViewModel:UpdateStyle(width, height)
    local root = self.view:GetRoot()
    local width, height = root:GetSize()

    
    local previewWidth, previewHeight = self.preview:GetSize()
    local l,t,r,b = self.preview:GetMargin()
    self.preview:SetMargin(width - self.margin - previewWidth, 
                           t,
                           r,
                           b)
                               
    
    local titleWidth, titleHeight = self.titleView:GetSize()
    self.titleView:SetSize(titleWidth, 50)
    local titleTextWidth, titleTextHeight = self.titleView:MeasureTextSize()
    local newTitleWidth = width - self.margin * 2 - self.marginGap / 2 - previewWidth
    self.titleView:SetSize(newTitleWidth, titleTextHeight + utils.getFontHeightDelta(17))
    
    
    local w, h = self.bottom:GetSize()
    local l,t,r,b = self.bottom:GetMargin()
    self.bottom:SetSize(width, h)    
    local bottomTop = height - h
    self.bottom:SetMargin(l, bottomTop, r, b)
    
    
    local w, h = self.descView:GetSize()
    local l,t,r,b = self.descView:GetMargin()
    self.descView:SetSize(width - self.marginGap - self.margin * 2 - previewWidth, 
                      bottomTop - self.margin * 2 - titleTextHeight)
    local descTop = self.margin + titleTextHeight + self.margin / 2
    self.descView:SetMargin(l, 
                        descTop, 
                        r, 
                        b)
                        
    utils.setBackground(self.view, app.themeConfig)
end

function ViewModel:OnResize(width, height)
    self.width = width
    self.height = height
    self:UpdateStyle(self.width, self.height)
end



function ViewModel:OnClick(sender)
	local id = sender:GetID()
    if sender == sender:GetRoot() then
        utils.loadUrl(self.jumpUrl, self.view:GetRoot())
        utils.report(self.view, self.index, "action.openurl", self.appid)
        return
    end
end

function ViewModel:OnSetMetadata(value)
	if value and value["contact"] then        
        local data = value["contact"]
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        self.previewUrl = utils.fixurl(data["preview"], self.previewUrl)

        
        if self.previewUrl ~= nil then
            utils.SetImageValue(self.background, self.previewUrl, "res/images/default.png")
        end
        
        utils.setSafeText(self.titleView,data["title"])
        utils.setSafeText(self.descView,data["desc"])
        
        self.appid = data["appid"]
        utils.report(self.view, self.index, "action.setmetatable", self.appid)
        
    end
    utils.asyncCallback(1, function()
        self:UpdateStyle(self.width, self.height)
    end)
end

function ViewModel:OnConfigChange(config)
    Console.Log("contact OnConfigChange appconfig="..Net.TableToJSON(config))
    utils.setBackground(self.view, config)
end 

function ViewModel:OnStartup(config)
    Console.Log("contact OnStartup appconfig="..Net.TableToJSON(config))
end
          _G['contact'] = {
            ViewModel = ViewModel
          }
        `;

  const code = `
          ViewModel={}

function ViewModel:New(view)
	local obj = {}
    setmetatable(obj,self)
    self.__index=self
	return obj
end

function ViewModel:Initialize(view)
    self.view = view
    self.touch = touch.TouchState:New(view)
    self.title = self.view:GetUIObject("title")
    self.desc = self.view:GetUIObject("desc")
    self.bottom = self.view:GetUIObject("bottom")
    self.tag = self.view:GetUIObject("tag")
    
    self.width = 251
    self.height = 139.25
    self.margin = 16
    self.marginGap = 17
    
    self.jumpUrl = "http://qq.com"
    
    self.index = utils.ReportIndex.INDEX_MESSAGES
end

function ViewModel:UpdateStyle(width, height)
    local root = self.view:GetRoot()
    local width, height = root:GetSize()

    
    local titleWidth, titleHeight = self.title:GetSize()
    self.title:SetSize(titleWidth, 50)
    local titleTextWidth, titleTextHeight = self.title:MeasureTextSize()
    local newTitleWidth = width - self.margin * 2
    self.title:SetSize(newTitleWidth, titleTextHeight + utils.getFontHeightDelta(17))

    
    local w, h = self.bottom:GetSize()
    local l,t,r,b = self.bottom:GetMargin()
    self.bottom:SetSize(width, h)    
    local bottomTop = height - h
    self.bottom:SetMargin(l, bottomTop, r, b)

    
    local w, h = self.desc:GetSize()
    local l,t,r,b = self.desc:GetMargin()
    self.desc:SetSize(width - self.margin * 2, 
                      bottomTop - self.margin * 2 - titleTextHeight)
    local newTop = titleTextHeight + 2 * self.margin - self.margin / 2
    self.desc:SetMargin(l, 
                        newTop, 
                        r, 
                        b)
                        
    utils.setBackground(self.view, app.themeConfig)
end

function ViewModel:OnResize(width, height)
    self.width = width
    self.height = height
    self:UpdateStyle(self.width, self.height)
end



function ViewModel:OnClick(sender)
	local id = sender:GetID()
    if sender == sender:GetRoot() then
        utils.loadUrl(self.jumpUrl, self.view:GetRoot())
        utils.report(self.view, self.index, "action.openurl", self.appid)
        return
    end
end

function ViewModel:OnSetMetadata(value)
	if value and value["messages"] then
        local data = value["messages"]
        self.jumpUrl = utils.fixurl(data["jumpUrl"], self.jumpUrl)
        
        utils.setSafeText(self.title,data["title"])
        utils.setSafeText(self.desc,data["desc"])
        
        self.appid = data["appid"]
        utils.report(self.view, self.index, "action.setmetatable", self.appid)
    end

    utils.asyncCallback(1, function()
        self:UpdateStyle(self.width, self.height)
    end) 
end

function ViewModel:OnConfigChange(config)
    Console.Log("messages OnConfigChange appconfig="..Net.TableToJSON(config))
    utils.setBackground(self.view, config)
end 

function ViewModel:OnStartup(config)
    Console.Log("messages OnStartup appconfig="..Net.TableToJSON(config))
end
          _G['messages'] = {
            ViewModel = ViewModel
          }
        `;

  ArkGlobalContext._setViewTemplate('view2021/contact.xml', `
<View id="contact" size="500,112" metadatatype="contact">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    
    <Image id="avatar" size="60,60" anchors="3" margin="12,12,0,0" radius="30,30,30,30" value="res/images/contact-default.png"></Image>
  
    <Text id="nickname" value="&#x6635;&#x79F0;" metadatatype="nickname" size="100, 20" anchors="7" margin="80,22,12,0" ellipsis="true" font="app.16" textcolor="0xFF000000"></Text>
    
    <Text id="contactInfo" value="&#x8054;&#x7CFB;&#x4FE1;&#x606F;" metadatatype="contact" size="100, 20" anchors="7" margin="80,46,12,0" ellipsis="true" font="app.14" textcolor="0xFF999999"></Text>
    
    <View id="seperator" anchors="7" size="239,0.5" margin="12,84,12,0">
        <Texture id="seperatorColor" color="0x7FE6E6E6"></Texture>
    </View>
    
    <View id="bottom" anchors="7" size="225,16" margin="12,90,12,0">
        <Image id="tagIcon" anchors="1" margin="0,1,0,1" size="12,12" value="res/images/contact.png"></Image>
        <Text id="tag" anchors="5" margin="17,1,0,1" autosize="true" value="&#x8054;&#x7CFB;&#x4EBA;" font="app.12" ellipsis="true" textcolor="0xFF999999" align="4"></Text>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
</View>
`);

  ArkGlobalContext._setViewTemplate('view2021/messages.xml', `<View id="messages" size="251,153" metadatatype="messages">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    <Text id="title" margin="16,16,16,0" size="251,50" textcolor="0xff03081A" value="&#x6807;&#x9898;" multiline="true" font="app.17" ellipsis="true" maxline="2"></Text>
    <Text id="desc" margin="16,44,16,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="3" ellipsis="true"></Text>
	<View id="bottom" margin="0,105.6,0,0" size="251,30">
		<Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
	</View>
    
    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
</View>
`);

  ArkGlobalContext._setViewTemplate('view2021/miniapp.xml', `
<View id="miniapp" size="500, 316" metadatatype="miniapp">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="app.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    
    <View anchors="15" comment="Layout attribute conflicts with pressed mark layer, so we use anthoer view hierachy">
        <Layout type="ListLayout" orientation="Vertical"></Layout>
    
        <View id="tagView" anchors="7" margin="12,12,12,0" size="200, 16">
            <Image id="tagIcon" anchors="11" margin="0,0,0,0" size="16,16" value="res/images/icon-default.png" mode="aspectfill" radius="2,2,2,2"></Image>
            <Text id="tag" metadatatype="tag" anchors="15" margin="20,0,0,0" value="&#x5C0F;&#x7A0B;&#x5E8F;&#x540D;&#x79F0;" ellipsis="true" font="app.14" textcolor="0xFF999999" align="4"></Text>
        </View>

        <View id="titleView" margin="12,8,12,0" anchors="7" size="200,20">
            <Text id="title" anchors="15" value="&#x6807;&#x9898; &#x7167;&#x7247;&#x7684;&#x6BD4;&#x4F8B;&#x662F;&#x4E94;&#x6BD4;&#x56DB;&#x7167;&#x7247;&#x7684;&#x6BD4;&#x4F8B;&#x662F;&#x4E94;&#x6BD4;&#x56DB;" ellipsis="true" font="app.17" multiline="true" maxline="2"></Text>
        </View>
        
        <View id="previewView" margin="12,8,12,0" anchors="2" size="239, 191" radius="4,4,4,4">
            <Texture color="0xFFF5F5F5"></Texture>
            <Image id="preview" size="23,23" margin="10,10,10,10" anchors="0" mode="aspectfill" value="res/images/pic-default.png"></Image>
        </View>
        
        <View id="seperator" margin="12,12,12,0" size="100,0.5" anchors="7">
            <Texture id="seperatorColor" color="0x7FE6E6E6"></Texture>
        </View>
        
        <View id="bottom" anchors="7" size="263,28">
            <Image anchors="3" margin="12,7.5,0,0" size="12,12" value="res/images/miniapp.png" mode="aspectfill" radius="2,2,2,2"></Image>
            <Text anchors="7" margin="26,5,0,0" size="30,17" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;" ellipsis="true" textcolor="0xFF999999" font="app.12" align="4"></Text>
        </View>
    </View>

    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
    
</View>
`);

  ArkGlobalContext._setViewTemplate('view2021/pic.xml', `
<View id="pic" style="display:flex;width:auto;maxWidth:700;height:auto;maxHeight:700;flexDirection:column;justifyContent:flex-start;alignItems:flex-start" metadatatype="pic">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0x00000000"></Texture>

    <View id="previewView" comment="&#x8FD9;&#x91CC;&#x8BBE;&#x7F6E;style&#x4E0D;&#x4F1A;&#x751F;&#x6548;&#xFF0C;&#x4EE3;&#x7801;&#x4E2D;&#x4F1A;&#x91CD;&#x65B0;&#x8BBE;&#x7F6E;" style="display:flex;width:700;height:200;flexDirection:row;alignItems:center;justifyContent:center;">
        <Texture color="0x00000000"></Texture>
        <View id="previewContentView" style="display:flex;width:100%;height:100%;padding:0.5,0.5,0.5,0.5" radius="8,8,8,8" comment="border">
            <Texture id="previewBackground" color="0x00000000" comment="color value will be set by code"></Texture>
            <View id="previewView" style="display:flex;width:100%;height:100%;justifyContent:center;alignItems:center" radius="8,8,8,8" comment="background">
                <Texture color="0xFFF5F5F5"></Texture>
                <Image id="preview" style="display:flex;width:23;height:23" value="res/images/loading_black.png" visible="true"></Image>
                
                <View id="touch_layer_icon" style="display:flex;width:100%;height:100%;position:absolute" visible="false">
                    <Texture id="touchTexture" color="0x0F000000"></Texture>
                </View>
            </View>
        </View>

        <Event>
            <OnClick value="app.OnClick" name="OnClick"></OnClick>
        </Event>
    </View>
    
    <View id="tagView" style="display:flex;width:auto;height:21;marginTop:8;flexDirection:row;alignItems:center" radius="4,4,4,4">
        <Texture id="tagBackground" color="0x21000000"></Texture>
        <Image id="tagIcon" style="display:flex;width:12;height:12;marginLeft:7" mode="aspectfill" comment="&#x6765;&#x6E90;&#x56FE;&#x6807;" radius="2,2,2,2"></Image>
        <Text id="tag" metadatatype="tag" style="display:flex;width:auto;height:17;marginLeft:3;marginRight:7" align="4" autosize="true" textcolor="0xFFFFFFFF" value="&#x6765;&#x6E90;" font="app.12" ellipsis="true" comment="&#x6765;&#x6E90;&#x6587;&#x672C;"></Text>
    </View>

</View>
`);

  ArkGlobalContext._setViewTemplate('view2021/video.xml', `<View id="video" size="257,142" metadatatype="video">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
		<OnSetValue value="app.OnSetMetadata" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnTouchStart value="touch.OnTouchStart" name="OnTouchStart"></OnTouchStart>
        <OnTouchEnd value="touch.OnTouchEnd" name="OnTouchEnd"></OnTouchEnd>
        <OnTouchCancel value="touch.OnTouchCancel" name="OnTouchCancel"></OnTouchCancel>
        <OnViewEvent value="touch.OnViewEvent" name="OnViewEvent"></OnViewEvent>
	</Event>
    <Controller type="Button"></Controller>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    
    <Text id="title" margin="16,16,16,0" size="251,50" textcolor="0xff03081A" value="&#x6807;&#x9898;" font="app.17" multiline="true" ellipsis="true" maxline="2"></Text>
    <Text id="desc" margin="16,44,0,0" size="152,48" textcolor="0xff878B99" multiline="true" value="&#x5185;&#x5BB9;" font="app.13" maxline="3" ellipsis="true"></Text>
    <View id="preview" size="50,50" margin="185,43,16,0">
        <Image id="background" anchors="15" radius="4,4,4,4"></Image>
        <Image id="playBtn" value="res/images/play_video.png" visible="false" size="33.5, 33.5" margin="0,0,0,0"></Image>
    </View>
	<View id="bottom" margin="0,105.6,0,0" size="251,30">
		<Texture id="bottomBg" color="0xFFF5F6FA"></Texture>
        <Text id="tag" metadatatype="tag" margin="16,0,16,0" anchors="5" size="0,30" align="4" textcolor="0xff878B99" value="&#x6765;&#x6E90;" font="app.13" ellipsis="true"></Text>
	</View>

    <View id="border" size="3,0" anchors="11" visible="false">
        <Texture id="borderBg" color="0xFF0099FF"></Texture>
    </View>
    
    <View id="touch_layer_icon" anchors="15" visible="false">
        <Texture id="touchTexture" color="0x0F000000"></Texture>
    </View>
</View>
`);

  async function luaRun() {
    if (WebArk && (!WebArk.LuaAdapter)) {
      throw new Error('[ArkRender] LuaAdapter not found');
    }
    let factory = await WebArk.LuaAdapter.getLuaFactory();
    if (!factory) {
      factory = new wasmoon.LuaFactory();
    }
    const lua = await factory.createEngine();
    Object.keys(arkWeb__namespace).forEach((key) => {
      // console.warn('aaa WebArk key', key)
      ArkWindow[key] = WebArk[key];
      if (key === 'Net') {
          ArkWindow[key] = Net;
      }
      if (key === 'UI') {
        ArkWindow[key] = UI;
        lua.global.set("jsProxyUI", UI);
      } else {
        lua.global.set(key, ArkWindow[key]);
      }
    });
    lua.global.set('ArkWindow', ArkWindow);
    lua.global.set('JSCreateView', (view) => {
        view = view.split('.')[0];
        const newView = CreateView(view);
        return newView;
    });
    const luaUIObjectInject = `
  LuaJSView2LuaViewMap = {

  }

  LuaUIObject = {
  }
  function LuaUIObject:New(jsUIObject)
    if LuaJSView2LuaViewMap[jsUIObject.hashId] then
      return LuaJSView2LuaViewMap[jsUIObject.hashId]
    end
    local model = {}
    setmetatable(model, self)
    self.__index = self
    model.jsUIObject = jsUIObject
    LuaJSView2LuaViewMap[jsUIObject.hashId] = model
    return model
  end

  -- Pos Start
  function LuaUIObject:SetPos(x, y)
    return self.jsUIObject.SetPos(x, y)
  end
  function LuaUIObject:GetPos()
    local pos = self.jsUIObject.GetPos()
    return pos.x, pos.y
  end

  -- Pos End

  function LuaUIObject:GetID()
    return self.jsUIObject.GetID();
  end

  function LuaUIObject:SetID(id)
    return self.jsUIObject.SetID(id);
  end

  function LuaUIObject:GetSize()
    local size = self.jsUIObject.GetSize();
    return size.width, size.height
  end

  function LuaUIObject:SetSize(width,height)
    return self.jsUIObject.SetSize(width,height);
  end

  function LuaUIObject:SetAutoSize(autoSize)
    return self.jsUIObject.SetAutoSize(autoSize);
  end

  function LuaUIObject:SetRadius(left, top, right, bottom)
    return self.jsUIObject.SetRadius(left, top, right, bottom);
  end

  function LuaUIObject:GetRadius()
    local radius = self.jsUIObject.SetRadius();
    return radius.left, radius.top, radius.right, radius.bottom;
  end

  function LuaUIObject:GetUIObject(id)
    local jsView = self.jsUIObject.GetUIObject(id)
    Console.Log('[ArkBuilder] LuaUIObject:GetUIObject jsView type:'..type(jsView))
    if type(jsView) == 'nil' then
      return nil
    end
    if jsView and LuaJSView2LuaViewMap[jsView.hashId] then
        Console.Log('[ArkBuilder] LuaUIObject:GetUIObject jsView cache:',LuaJSView2LuaViewMap[jsView.hashId])
      return LuaJSView2LuaViewMap[jsView.hashId]
    end
    return LuaUIObject:New(jsView)
  end

  function LuaUIObject:GetTexture(textureName)
    return self.jsUIObject.GetTexture(textureName);
  end

  function LuaUIObject:GetRoot()
    local rootView = self.jsUIObject.GetRoot();
    if rootView and LuaJSView2LuaViewMap[rootView.hashId] then
      return LuaJSView2LuaViewMap[rootView.hashId]
    end
    return LuaUIObject:New(rootView)
  end

  function LuaUIObject:GetParent()
    Console.Log('[ArkBuilder] LuaUIObject:GetParent start')
    if self.jsUIObject then
      local parentView = self.jsUIObject.GetParent()
      Console.Log('[ArkBuilder] LuaUIObject:GetParent ing:'..parentView.id)
      if parentView and LuaJSView2LuaViewMap[parentView.hashId] then
        return LuaJSView2LuaViewMap[parentView.hashId]
      else
        return LuaJSView2LuaViewMap[self.jsUIObject.hashId]
      end
    end
  end

  function LuaUIObject:MeasureTextSize()
    Console.Log('aaa MeasureTextSize start'..type(self.jsUIObject))
    if self.jsUIObject and self.jsUIObject.MeasureTextSize then
      local size = self.jsUIObject.MeasureTextSize();
      return size.width, size.height
    end
    Console.Warn('[ArkBuilder] warn LuaUIObject MeasureTextSize is nil')
    return 0, 0
  end

  function LuaUIObject:AddChild(view)
    local jsView = view.jsUIObject
    return self.jsUIObject.AddChild(jsView)
  end

  function LuaUIObject:SetAnchors(anchors, update)
    return self.jsUIObject.SetAnchors(anchors, update)
  end

  -- Margin Start
  function LuaUIObject:SetMargin(top, right, bottom, left)
    return self.jsUIObject.SetMargin(top, right, bottom, left)
  end

  function LuaUIObject:GetMargin()
    local margin = self.jsUIObject.GetMargin()
    return margin.left, margin.top, margin.right, margin.bottom
  end

  -- Margin End

  function LuaUIObject:AttachEvent(event, fn)
    return self.jsUIObject.AttachEvent(event,fn)
  end

  function LuaUIObject:SetVisible(visible)
    return self.jsUIObject.SetVisible(visible)
  end

  function LuaUIObject:GetVisible()
    return self.jsUIObject.GetVisible()
  end

  function LuaUIObject:SetRootSize(view, width, height)
    if LuaJSView2LuaViewMap[view.hashId] then
      return self.jsUIObject.SetRootSize(LuaJSView2LuaViewMap[view.hashId], width, height)
    end
  end

  function LuaUIObject:SetValue(value)
    return self.jsUIObject.SetValue(value, true)
  end

  function LuaUIObject:GetValue()
    return self.jsUIObject.GetValue()
  end

  function LuaUIObject:GetFont()
    return self.jsUIObject.GetFont()
  end

  function LuaUIObject:SetFont(value)
    Console.Log('aaa LuaUIObject:SetFont')
    return self.jsUIObject.SetFont(value)
  end

  function LuaUIObject:GetLineHeight()
    return self.jsUIObject.GetLineHeight()
  end

  function LuaUIObject:SetLineHeight(height)
    return self.jsUIObject.SetLineHeight(height)
  end

  function LuaUIObject:SetMaxline(value)
    return self.jsUIObject.SetMaxline(value)
  end

  function LuaUIObject:LockUpdate()
    return self.jsUIObject.LockUpdate()
  end

  function LuaUIObject:UnlockUpdate()
    return self.jsUIObject.UnlockUpdate()
  end

  function LuaUIObject:ClearChildren()
    return self.jsUIObject.ClearChildren()
  end

  function LuaUIObject:SetRect(left, top, right, bottom)
    return self.jsUIObject.SetRect(left, top, right, bottom)
  end

  function LuaUIObject:SetStretch(stretch)
    return self.jsUIObject.SetStretch(stretch)
  end

  function LuaUIObject:GetType()
    return self.jsUIObject.GetType()
  end

  function LuaUIObject:SetMode(mode)
    return self.jsUIObject.SetMode(mode)
  end

  function LuaUIObject:GetMode()
    return self.jsUIObject.GetMode()
  end

  function LuaUIObject:SetTextColor(color)
    return self.jsUIObject.SetTextColor(color)
  end

  function LuaUIObject:IsType(type)
    return self.jsUIObject.IsType(type)
  end

  function LuaUIObject:GetStyle()
    return self.jsUIObject.GetStyle()
  end

  function LuaUIObject:SetStyle(style)
    return self.jsUIObject.SetStyle(style)
  end

  function LuaUIObject:DetachEvent(event)
    return self.jsUIObject.DetachEvent(event)
  end

  function LuaUIObject:GetRect()
    local rect = self.jsUIObject.GetRect()
    return rect.left, rect.top, rect.right, rect.bottom
  end

  -- canvas Start
  function LuaUIObject:ClearRect(x,y,width,height)
    return self.jsUIObject.ClearRect(x,y,width,height)
  end

  function LuaUIObject:Save()
    return self.jsUIObject.Save()
  end

  function LuaUIObject:DrawImage(image, left, top, iconWidth, iconHeight)
    return self.jsUIObject.DrawImage(image, left, top, iconWidth, iconHeight)
  end

  function LuaUIObject:SetDrawStyle(color)
    return self.jsUIObject.SetDrawStyle(color)
  end

  function LuaUIObject:DrawCircle(x, y, length)
    return self.jsUIObject.DrawCircle(x, y, length)
  end

  function LuaUIObject:Restore()
    return self.jsUIObject.Restore()
  end
  -- Canvas End

  -- UI start
  UI = {
  }

  function UI:View()
    local jsProxyObj = jsProxyUI.View()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  function UI:Text()
    Console.Log('UI:Text start')
    local jsProxyObj = jsProxyUI.Text()
    Console.Log('UI:Text jsProxyObj', jsProxyObj)
    local model = LuaUIObject:New(jsProxyObj)
    Console.Log('UI:Text model', model)
    return model
  end

  function UI:Image()
    local jsProxyObj = jsProxyUI.Image()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  function UI:Canvas()
    local jsProxyObj = jsProxyUI.Canvas()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  function UI:Video()
    local jsProxyObj = jsProxyUI.Video()
    local model = LuaUIObject:New(jsProxyObj)
    return model
  end
  -- UI end
  `;
    let finalCode = '';
    const moduleIdList = [];
    
        










            finalCode = finalCode + code$k;
            moduleIdList.push('app');
          

            finalCode = finalCode + code$j;
            moduleIdList.push('debug');
          

            finalCode = finalCode + code$i;
            moduleIdList.push('flexutil');
          

            finalCode = finalCode + code$h;
            moduleIdList.push('fontutil');
          

            finalCode = finalCode + code$g;
            moduleIdList.push('picutil');
          

            finalCode = finalCode + code$f;
            moduleIdList.push('qqutil');
          

            finalCode = finalCode + code$e;
            moduleIdList.push('textutil');
          

            finalCode = finalCode + code$d;
            moduleIdList.push('theme');
          

            finalCode = finalCode + code$c;
            moduleIdList.push('touch');
          

            finalCode = finalCode + code$b;
            moduleIdList.push('uiutil');
          

            finalCode = finalCode + code$a;
            moduleIdList.push('utils');
          

            finalCode = finalCode + code$9;
            moduleIdList.push('musicplayer');
          

            finalCode = finalCode + code$8;
            moduleIdList.push('news');
          

            finalCode = finalCode + code$7;
            moduleIdList.push('music');
          

            finalCode = finalCode + code$6;
            moduleIdList.push('news_base');
          

            finalCode = finalCode + code$5;
            moduleIdList.push('music_base');
          

            finalCode = finalCode + code$4;
            moduleIdList.push('news_channel');
          

            finalCode = finalCode + code$3;
            moduleIdList.push('music_channel');
          

            finalCode = finalCode + code$2;
            moduleIdList.push('video');
          

            finalCode = finalCode + code$1;
            moduleIdList.push('contact');
          

            finalCode = finalCode + code;
            moduleIdList.push('messages');
          





        const applicationViewEvents = {};
          applicationViewEvents['news'] = [{
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }];
        
          applicationViewEvents['music'] = [{
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }];
        
          applicationViewEvents['news_base'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['music_base'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "app.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }];
        
          applicationViewEvents['news_channel'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['music_channel'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "app.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }];
        
          applicationViewEvents['video'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['contact'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }];
        
          applicationViewEvents['messages'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['view2021/contact.xml'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['view2021/messages.xml'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['view2021/miniapp.xml'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "app.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
          applicationViewEvents['view2021/pic.xml'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }];
        
          applicationViewEvents['view2021/video.xml'] = [{
      "eventName": "OnResize",
      "callback": "app.OnResize"
  }, {
      "eventName": "OnSetValue",
      "callback": "app.OnSetMetadata"
  }, {
      "eventName": "OnClick",
      "callback": "app.OnClick"
  }, {
      "eventName": "OnTouchStart",
      "callback": "touch.OnTouchStart"
  }, {
      "eventName": "OnTouchEnd",
      "callback": "touch.OnTouchEnd"
  }, {
      "eventName": "OnTouchCancel",
      "callback": "touch.OnTouchCancel"
  }, {
      "eventName": "OnViewEvent",
      "callback": "touch.OnViewEvent"
  }];
        
        
    /** 注入app的注册事件 */
    applicationViewEvents['app'] = [{"eventName":"OnCreateView","callback":"app.OnCreateView"},{"eventName":"OnExit","callback":"app.OnExit"},{"eventName":"OnStartup","callback":"app.OnStartup"},{"eventName":"OnConfigChange","callback":"app.OnConfigChange"}];
    /**
     * getSupportProxyEventNameTemplates
     * @params eventName 事件名称
     * @params host 事件宿主
     * */
    const getSupportProxyEventNameTemplates = (eventName, host, callbackName) => {
      host = host || '_ENV._G';
      callbackName = callbackName || 'OnSetMetadata';
      const supportProxyEventNameTemplates = {
        OnSetValue: `
        function (sender, value)
          if type(value) ~= 'table' and type(value) ~= 'userdata' then
            Console.Log('LuaBridge: ${callbackName} value is not table')
            return
          end
          local luaView = LuaJSView2LuaViewMap[sender.hashId]
          if type(luaView) == 'nil' then
            luaView = LuaUIObject:New(sender)
          end
          local tableValue = {}
          Console.Log('LuaBridge:${callbackName} value', value)
          for k, v in pairs(value) do
            tableValue[k] = v
          end
          Console.Log('LuaBridge:${callbackName} jsonToTable', tableValue)
          ${host}['${callbackName}'](luaView, tableValue)
        end
      `,
        OnCreateView: `
        function (view, template)
          local luaView = LuaUIObject:New(view)
          ${host}['OnCreateView'](luaView, template)
        end
      `,
        OnConfigChange: `
      function (config)
        Console.Log('LuaBridge:OnConfigChange start config:', config)
        ${host}['${callbackName}'](config)
      end
      `,
        OnStartup: `
      function (config)
        Console.Log('LuaBridge:OnStartup start config:', config)
        ${host}['${callbackName}'](config)
      end
      `,
        OnClick: `
        function (sender)
          local luaView = LuaJSView2LuaViewMap[sender.hashId]
          if type(luaView) == 'nil' then
            luaView = LuaUIObject:New(sender)
          end
          Console.Log('LuaBridge:${callbackName} ${host} ${callbackName}')
          ${host}['${callbackName}'](luaView)
        end
      `,
        OnDestroyView: `
        function (view)
          local luaView = LuaUIObject:New(view)
          ${host}['${callbackName}'](luaView, template)
        end
      `,
        OnExit: `
        function ()
        ${host}['OnExit']()
        end
      `,
        // 'OnTouchStart',
        // 'OnTouchEnd',
        // 'OnTouchEnd',
      };
      return supportProxyEventNameTemplates[eventName];
    };
    // luaBridge对象构造
    const luaBridgeTemp = {};
    // luaBridge函数对象映射
    const luaBridgeFunctionMap = {};

    /**
     *
     * 替换对应Lua函数代码
     * @param {*} luaBridgeFunctionMap
     * @return {*}
     */
    const generateLuaBridgeInjectCode = (luaBridgeFunctionMap) => {
      const luaBridgeFunctionMapStr = JSON.stringify(luaBridgeFunctionMap);
        return luaBridgeFunctionMapStr.replace(/\"(\w)*\"(:|=)/g, (a) => {
          return a.replace(/\"/g, "").replace(/:/g, '=');
        }).replace(/\"|\\n/g, "");
    };
    /**
     * 将字符串数组转成深度对象
     * @params curObj 当前操作对象
     * @params eventCasts剩余数组
     */
    const listToDeepObj = function (curObj, eventCasts) {
      if (!eventCasts || eventCasts.length === 0) {
        return;
      }
      if (eventCasts.length === 1) {
        curObj[eventCasts[0]] = `__${eventCasts[0]}__`;
        return;
      }
      const cast = eventCasts.shift();
      curObj[cast] = {};
      listToDeepObj(curObj[cast], eventCasts);
    };
    Object.keys(applicationViewEvents).forEach((key) => {
      const viewEvents = applicationViewEvents[key];
      viewEvents && viewEvents.forEach((viewEvent) => {
        const { eventName, callback } = viewEvent;
        if (!getSupportProxyEventNameTemplates(eventName)) {
          return;
        }
        const eventCasts = callback.split('.');
        let tempHost = '';
        if (eventCasts.length < 2) {
          tempHost = '';
        }
        if (eventCasts.length === 2 && eventCasts[0] != 'app') {
          tempHost = eventCasts[0];
        }
        if (eventCasts.length > 2) {
          tempHost = eventCasts.slice(1,eventCasts.length-1).join('.');
        }
        const eventTemplate = getSupportProxyEventNameTemplates(eventName, tempHost, eventCasts[eventCasts.length-1]);
        const lastIdx = eventCasts.length - 1;
        const viewKey = tempHost || 'app';
        if (!luaBridgeFunctionMap[viewKey]) {
          luaBridgeFunctionMap[viewKey] = {};
        }
        luaBridgeFunctionMap[viewKey][eventCasts[lastIdx]] = eventTemplate;
        /**
         * {app: {OnSetMetaData: function}}
         */
        const bridgeItemKey = eventCasts.shift();
        if(!luaBridgeTemp[bridgeItemKey]) {
          luaBridgeTemp[bridgeItemKey] = {};
        }
        const eventCastObj = {};
        listToDeepObj(eventCastObj, eventCasts);
        Object.keys(eventCastObj).forEach((key)=>{
          luaBridgeTemp[bridgeItemKey][key] = eventCastObj[key];
        });
      });
    });
    const luaBridgeInject =  `
    LuaBridge = ${generateLuaBridgeInjectCode(luaBridgeFunctionMap)}
    _ENV._G['LuaBridge'] = LuaBridge
    -- 注入全局Bridge CreateView
    _ENV._G['CreateView'] = function(id)
      Console.Log('[ArkBuilder] Lua Bridge _G CreateView start id:'..id)
      local jsView = JSCreateView(id)
      Console.Log('[ArkBuilder] Lua Bridge _G CreateView:'..jsView.id)
      local luaView = LuaUIObject:New(jsView)
      return luaView
    end
  `;
    finalCode = `
    ${luaUIObjectInject}
    ${luaBridgeInject}
    ${finalCode}
  `;
    await lua.doString(finalCode);
    // 将app以及app内部字段依赖注入lua全局
    const luaGlobalWith = lua.global.get('_G');
    ArkWindow.app = luaGlobalWith['app'];
    // 注入其他依赖Lua模块
    moduleIdList.forEach((moduleId) =>{
      ArkWindow[moduleId] = luaGlobalWith[moduleId];
    });
    // 覆盖需要代理的类型
    const luaBridgeApi = luaGlobalWith['LuaBridge'];
    ArkWindow['LuaBridge'] = luaBridgeApi;
    if (ArkWindow.app && luaBridgeApi) {
      Object.keys(luaBridgeApi).forEach((key) => {
        ArkWindow.app[key] = luaBridgeApi[key];
      });
    }
    // 覆盖需要代理的函数
    ArkWindow.app.getExtendObject = ArkWindow.getExtendObject;

    return lua;
  }

  const uniqueApplicationId = (function() {
     function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
     }
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
   })();

   /**
    * 有很多地方会用到这里数据.所以这里最好还是挂载到app上.
    * @returns
    * @update 2022-07-30 22:47:10
    * @author alawnxu
    * @description 这里之前挂载app上.不过后面发现不可行.因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
    */
    ArkWindow.getExtendObject = function () {
     var appKey = '137bf2d6bd2b61f322117543861a09b1';


     return {
       appid: 'com.tencent.structmsg',
       appKey,
       images: [{"name":"res/images/contact-default.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.structmsg/res/images/contact-default.png"},{"name":"res/images/contact.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABVCAYAAAA49ahaAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAU8SURBVHgB7ZzbbdtKEIbHF/k1PhUcuYLI8AXwU+gKjlzBiSuwU0GUChJXYKWCyBWYeTJgG3BSQZgKojz7lv+Xl4kgcCmS5iwZYT6AoERSpPhzdvYysxQxDMMwDMMwDMMwDGORWZKWcXl52VteXn61tLTUw9fo8fFxHet1t3uMJXFL/PDw8Hl3d/eLtIxWiHpzc7MOgY4gYB9fe2V+i98kq6urg83NzY/SEhoX9fr6+girgfyxxkq0SdzGRL24uOh2Op1TfIykRpy4+xA3kYZoRFTnN8/lmdbpg8JiOWjK3y5LYOA//4egN6IkKEEl1+U1eC1pgKCWWsJCY1jaZ65RlJO0KLNCu7u760G0l1iOcUx3znnGqAD3Q1tsMFHpQ9fW1s7nCEEx3+3s7MRSgKurqwgP6TTvnE342GDFf2VlZTDn5t9sb2/vFxWU8Nitra0NPgjfMXQF9/f3pxKQIJaKZtNrrHw3NmalUkbMLGi1EPCTeFwLrrH/3GsUJYil4mbf5uw+rONm3TkOpdp/qBV1UWGlfV+xZ7FFkR9JTbhznXh2R7RmCUAIS81s1rACgXUNpGbou2GVSda+UNYaQtR+1kZ2KUUB1PJsRvmstcdmmSijKmpOcRtr9tHxwIbyNKI1y6SdK8poW2qUtdE17NVw1nrm2f13i5rTLo1FGfjPzF4UOgsvRRlVUXED/2ZtR/H8Jsr4KitY8D+iTPABFQK/9lOUQSnJ8qkU+4Uo04ioi46qqChq37O2sz8uyviuAQtWLyXaPnXs2aVeA/uu4fO1daJd/H3jmOo1MHiVtRE9rnNRRlXU29vb2LNLtR/OsVvxl4avooyqqHt7e4mvuME1qIU62P/P2s7xhhCD1eq1PyqrzO4obvC1hrXSSnMeWJDwtbqoaOh/kOx+ODmtc4CD52LIRvz/ZSgBUBeV/XDxWEjdoQ6ey9c1xrWGoeJUQcIptCDcMLumPquM4QcPq960Oz9DKVHW/tDBvyA9KlprXnAOROi6nleJ09Mvw28zjyDyHePSgRIJRNC4P0Ir9K9Hcw6j1Q7zxlun4v8cyY8knxOEWY4lIMHTfiAsK5KowKH0xew8fE0HRzjq5Xwm26BFKrgRBD2QwKxKYGCFB65y6s85lKJFXGCRkw0QVIrCplyn0wlqoSmNZf3BFw4UA3HBi/w0jeanMsmCwhbIiSoEa3mpKY/gObQik7oGcdm6OGFHw7WLG6VVOf8uPeg/efKl8yoiihdj+Qg/HbdBzJTWTaRIcWmXXXxkjT+JK8Gaf2D104mYiGEYhmEYhmEYhrFgNN5NxSg+g38RPr7gHH83v7+Lz+szc/1Txtg3diNShMkRjH99xxhq0ob5/0FFnQqDcICaqT9FR/DLMIkYpNMwmxgGVBfVRToZ0EtfkKA+kWGGyWgWBmFGWJ+FGM1SE9XNwCsSmAsJXceIoRZNC65V1KnXdjCUEdoiS6H5JotaRP2bxJxFQ9xniVqTmL9D0TJViyMSyu3jWR/ocq9Y4U1aCPjMyRob8lTxRVKROsWtLCrnnOKm3leIK038Gn73BZXHWd0j+OkrmOSpYoykJHW8KqS0qBVfKDNJUsOfHYVu4vDhw/L7ZfNhmdCG37yr8tBLiVog0WyWGMtJGwJzzhiiMlFb5xI2y/730paKptIxi/2cw0q9tiM0RZt77h4GUpJKPjUnH6rVYs6S9w4WN3V+QypQSVRXlH6/BqktmSFVyUrmgMvaCB4GpxvAn3lkTpQsADQUtByGjd+Tm1qzULBJJoZhGIZhGIZhGEZD/AJafLZ0pGba2AAAAABJRU5ErkJggg=="},{"name":"res/images/default.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.structmsg/res/images/default.png"},{"name":"res/images/icon-default.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAoSURBVHgB7c0xAQAwCAMwNv92e4MJ+BIDeUm6Dv06JhAIBAKBQLBjAAaKBA4IDYM3AAAAAElFTkSuQmCC"},{"name":"res/images/image_break.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAMAAAAL34HQAAAANlBMVEUAAADj6O3i5+zi5+zk6e7g5eri5+z6+/zo7PHg4ePd4ufs7/Pi5enZ2tz19vnx8/bk6Oz8/f2v/7/mAAAAB3RSTlMA1lxFnIiS2Xg+EAAABBpJREFUeNrt2uFyqkAMBWCoWs6a3QTe/2WvyPVmVBSWRHdnLudnZ1q/JqcLaJsph2OLCtIeD43mpyXuqghT+3NT/daCmmC/k+pEXVWh03WDlakurnGPqGiDUxhNc6huWF1Hh+ZY3bC6jo9N21WYtkFXYbCzdtaUnZWTnZWTnZWTnZWTnZWTnZWTnZWTnZWTnZWTnZWTnZWTnZWTnZWT/4fVdxWmX8PizhZ/FhNhDImDjZxYAmiIrarAHiwm3IdMKg7wYAmewwYVkmmJqnJ1SQpiZzHg6uKQqLOzoHHpF6UgdhbhVWTrsMBmFuN1NrF6HZaBRXgd2db3yHYWNC7tCilQZ2Yx4LpFpBDYzhJoHM4Ivqj6zs4iwLNc8cKS6lhyUcUXc5QxXIR1UQUMM1x9GZJvs4Z+ZK24PeGvVp5HVRxW/OLE3zsghjCGhlU/n751nA5II2v1MvhLF5+rqh9WN1e+cakewpUliyoNfeHGhlIYk6EC6PO3gZMKQ4YKoA/fNA9xYnGWCqDPPmLIpIqDfgWrQp98IBtSeDi0GCtjenxdvuo8FB5mlv1hn1N42CEZWRqWrW+NDOFvJKtYynKOXnWmaLEqYHV/VXpoURYrdv7RFeqhJchI/BCLbsOK/1ZYA+umSrcdUgWs21VHCy+ogCV/VXpooQLWkMItMrGoAtbtqqNLZFTAYlWllMZ5UQWs6chSGAZGedbtqqOwwDVM659KB0ZiYLmvUAvWCxVmRfXcL7Isi+McSxdZqvIS5qKLLHVuUQiGRSrLO3jhSiQGln+99C+SCrDUFV6FzSz/2odEYmf5175nKsoa5mvPpSqvrpnao4OZ5V/7yFScNVN7keIPZGPoqe81slhQBSukEDTUwZHFQhv/x4bSQ9/9WEKb33bjLX1X1vkNCppcGFPK7rvm/Jo194Nk67BY4MMizIY3DYs6uLDE+AEZz5zvdhYZP+aUh2EJHFiM95FFFT+d73aWYCnEC8W6H5YIbCxdoGVgdD8sMGwsXaBlYHQ/rASxsXSBloER+PEOnowsAmCEEQjpwWWrvKq2b5IAeX6eFguLkB2Spw7osNQF2sxibAsJ311EZfYxnzayGIaQvuw0LNsalcVwiqQwkxQpk+Wp0mEZ6qUswaeGpfUSymUJvIe1vV7KEngPa3u9lMVwH9bmeimL8eFhab1yWPBkhXdJgQqx4ntXT0VYhPDeVYYFWmAlqpE11qsIKy6Nqy/CQlhIKsECLbIS1cgKZVhx0VWChX5pWBElWIudhwfLv1z9KlaAc6LDtELTAl8tV8SKtM2xh3Psp2l/bA4RzrHvMB4a986jd2h80/x4u3rzqfXTXHLyXqNxh/HUXHPynVdv2+F5Ul33GPsvuZa+NV42qDn8tme/xJc5v01ofw+T5w/b4qJxk+eGIAAAAABJRU5ErkJggg=="},{"name":"res/images/image_default.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAMAAACsAjcrAAAAVFBMVEUAAABeaHRCSlI4PkRibnoGBghWXmhseIVkZGQSFBYeICIkKCxQWGJcZnJQUFBIUFpeaHIuNDpsdH5qbG5qcnxqbnRueolseododINmcH5qdoVgbHhwp7snAAAAFnRSTlNM75mF91DJ6X5WYGq54XKn13bTj8WlS4dltAAAArtJREFUeAHswQEBAAAAgJD+r+4IAgAAAAAAAABgbs0D0XEQBqLBBhL3bhXuf87fmxw2ZLv4c4K8WMOMsL+lmqHtfFvUuWP4EIiIQmizRikCIQMAMJKZcuZAgP1FwBTKXDmmgLB/CNA0eXI488bxQeLzBCkJdiGgPB+J510KsM0SxMJ+EI85clR0BQI2SxDcvweIi4CcTznqDFcgc5Yg6zXIFhvB1oROc+i7no8g5zpSKw0RUhg0u32F9AOpDTEAoOoi1kuXwBx5ICPBWxGrFA/X8pUE5v5GjQEaNNvkMn+QwBrhOI0fvZKNU234bT6/2HxdYhwNfYJSqTvf+8uybculj/7f7Zeir7/ku6r6EaXlr/2lyncVlhtkkS1IJyKTu2x3eoJsF0ghj5DrAilUHzcvti5LkAEPIIBlnrdFnPVOL2uWFFCdIcjI+1GAQ0YAsmZJsdF3JKWGpMUICNCkrCr6EPxNFGdZMqhsjlVHiNTV99Ystc3REwMweXdvzVLaHAfi14Ev0jVLc5TUluEFhG11v9UVNkePkIqFykoOfc1RTg3b+n6rq7uEGBHiL9vSVld1CVESyIBLW12KvZZOK9/kurTVVUbJcFxfh7TVNUZJfWwebJv7ra7jEiI+NICjS1tdXZQ0xNc/q0hbXV2UjNdDA2zrSGDeElunb3uVYSKtrjZKnEFI/y5pdZVRUhDEZ95WcavrjBJ5tx4fLml1hVGSyGumMm11GSWajl7RVKq41dVFSeKvBvJO3JMmBDioOXql+I2kiftI0QWX6/AWCDCZoqmL+AGt6YKrSPUOpvCkCEdc/6umVIaTec2IDPudAusUrCG/KgXvSgzvf1jsFXy/+CcEo4LP/vIFOa3wx0GW/wLSb/P5T2pel+q/fTzzJ9X37vTYHhwTAAAAAAzp33oZ9mMAAAAAAAAAAAhCHNeuJ6lBGgAAAABJRU5ErkJggg=="},{"name":"res/images/image_fail.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAMAAACsAjcrAAAAWlBMVEUAAABseIVjY2NibHgYGhxLS05CSlIaHiBeaHQwNDxUX2lQWmJIUFo6QEhcZnJqdH5WXmhseIUkKi44ODhqcnpmaGpncX9scnhmanBYYmxueolodINkcHxganYOGvBZAAAAGnRSTlNM6X71WHGZYN94zLWnievTw/NsYsOP77Gh17nAdoAAAAMlSURBVHja7drNlqIwEAXgUhJQUJAfFeuG93/NsT3NAAboHmdhxVPf0kUfqk1SN4WklFJKKaWUUkoppZRSSimllFJKKaU+UnXIbmkWJxS2Ku06d9d1WdClxJ0D+A5w+Z6CFXfgHtAFW8m+A48gCnV15eAJnChIR/ATV1GIUq8QZBSiiJ9hRyECey4UIPMphXzMN0IX9hQUooY9Lc3I8i4/kmAW/KSsyVPlDnDdgQQr+MmVPEn+SJXoJH8ndsMTRU2eG/gBOQl23kzqsOQ5Ov4G0YtrO1pdjSXfDUM2JslsW5SPbd6c5+qo3FAoZF9XjN2e2/a8tTQnw6iQlKQzhhZE4IEzFKoYPIKYQrXDB4T8uz14AmFeIIlO+IgLJJn+7A2klSw6+Hd6yYHL4529QbWS+WmRx4U4whtPi8JIjvMSx2Niw3ySkGcxZslNjibtujT51VaXPR5+3MNzQ8viC89yJEnqwAzc1mJWUXJPbHKMHfiLW36oyuHKd7LHwxn6yGGWYxaygr9IfvVg8WNbiBgX+1hckl89mNJ/2ebfqHBs+YvY5JiOJnM4Ld+osDON5FZy7A7Ucs/tl29U2D8meFKTY46ILNYzxwnfX9eZe+KGEAd8bfHLegx0fdY1jdRWkkRgRKPng6vmtnpfZL0R2koeLQRZC+7hNrPVhwPqXIpsJZV7FOKGTTLT3/cYX22vIlvJDd9Psln55cYJ40VUFwJbSf+SAChWzlPHk9PZlixuCJH/zSaTkO6OM1t9aJituFYSgz1+eNzhadpQF8JaifEufXNJZQ9v2mBLWa0kAy/AaHGd4O/rVlQrSZxfiJ9UjJvZ16aRNOAa5lRrSfCAuf+93cgZcO0dr4BLh47ZG/Kxlx5xoXfZgdcryeMqiSPMHwSmkXIricHrANd1bnHeW2+EDLgi8E9wxwvzXj89RvQWB/BrhmR1FRFTolcLGR65vm4ErK3X6xi6X72dlPKrniiqkGFCcS+lfPOv7Rp+ybCKvFLKM72DvRab1+1oUG+b+ydFczb0FrXd/ofpn7p/YC0ppZRSSimllFJKKaWUUkoppZRSSv2LP71C6YirV6RBAAAAAElFTkSuQmCC"},{"name":"res/images/loading.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAABsCAMAAAC4uKf/AAAC/VBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+G1NxwAAAA/3RSTlMABAsNBRAJAQMCEwgZHz0bQw8SBxYGMxUrN34/IzkXwMYxjCERLym6gCR4cGKELC0lpmaSVUWOmpAdRl9Y8Cca5qwMllIUqApQIJyKDjpnNS6v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"},{"name":"res/images/loading_black.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.structmsg/res/images/loading_black.png"},{"name":"res/images/loading_white.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.structmsg/res/images/loading_white.png"},{"name":"res/images/miniapp.png","url":"data:image/png;base64,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"},{"name":"res/images/pause_music.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABICAYAAAC6L9h5AAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATmSURBVHgB7ZyLedMwFIVvOkGZAJUFKBPULABMwGMBHhOkMAAtEwATAAvgwALQAajTAWjKAj3oxlLr5vPVw3Yc2en/fTdOnNiWT46uZFv2hHoEwK6eKB0HOvZ03NWxb75WKz+f67gwcaKj4OlkMpnR2GBhdLzSketYoBtyHc90KBoqK8Ksm5wFo6FgxJmiO8fEUJhtK0qRDYuzSqFjSimhC5SZgqXGqY6MOmBCDUHZUvE/9pri4NZqpuNMx28TF7rVmq+sX1HZ4vF2uAU8MNNdiuNIxzu9/gvqE94BxLmHq+Fh239WL2+dexy5/VP0matMIUNzT46OLF9TDluWPLAs5zqe0LpB2axvVJyaMnHs6fgSUK5LHbHpIaow04BCFH2JU1M+jufwV0MWqvvWD2EO4jwRm1S7LqfNl58ChOrOUXplTzwbXGCdFm6AEetNgFAZtcX8KwuPQPuUIEaoB3BXP07mipqCshft2kCBxA8wcZ3UXfvB3YNmaUIveDRkgSwVoVw14j3FAn8eSrKKSeC66klCxecnuO2ZVJIOBf5kHl7t4O4PfaQBo8s/QdlVkTgMWYnrmIznKxowxk13HPt47nWTx0XDOfvnwAj1EE3d5FD4C40IlNUuR6ybUB73SCgaER43yYcsDmVzGiEeN32vW0BBJqMWIADHTvi4pIbA76arKrdjppmwrvkoLwZq9H7xZEbl6eQ6nts3ViSp5fpG44Zd/KFmPiv4yH7wOekrjZ8fwvz9qyqH8jxxHQvqACSak1a2sxDy0vIYlZ0kHaz+pu1hJszP+IVFUsIPJBuOkbOaeZyXeNTLUqT7woK/aDvg6n4ifKf4hUWSDuj+0fYgpZalgVwizWl7cF4Cn0ity8T0ttoird+3LW519MTXekEvukMtcWxruf7WG9gGbkUK4FakAFiked0XGNk5JAmTMpXw9ZxfXE7a6HX9nlHC/GWrxyJJfYRBXVtriWSIK5HOhB8o2h6ko45lT1zMSbQ9TuI+0kHNfE5Wc37DIs2EhQ9oe5AMccNJdd1yHlWS0YgxLVtGQk6yp653zNBdKXlnNG64qj0WvpvZN7YLIJ3LfkXjp04kttinm3PKAVsSGbUAiZ6+hf+SkqpbKBcWGN3FSSNQ3MVJs+BryGQ0InA9+k1y0VNpQa5yi7G7qeKir8K+nvpWcIgRu6ki0AvILpr6VuJyU4END2ZvC/yjccNu1PG46YgGSsVFn9HURZWV+cZvD25gaUUgV+N0GrvSzLGyZO8CqMMIZIcow+GijGKBe5QqC6UocSoCufIQC9QsjWDgt01UBLrn2Y8/aNMgwX8DToEEqx6uc9ADT/nb3YBT2aArP1mSSOYV99gk7RKIq9lj6gq4WwXLR2yw+lUE4sHsx56yskDdn+GAu/9kKdDzoHjcdM9DbOr20kqBQhzF8E3DitbMijh5QLnW46CagvFtXinc8h4jDvMXfR5/Iv7hCfzbY3T38ASu+qF/FLuHm3lFDWn7GI5Dij/Fa8+p/zBT/jwXHsNhH8HBwUPzMoq7smyHIL/t/TEcN0qR5gNd2D2dPdClM1BWgQKbhcXhDuIUqZ7WQZmrNiFW+uLUgfLWsBzr49LEdx0vByXOKijd1YVgVpTzvoXpZPBoDCiTKY/i2DPTXRNq5aeFmXILeGY+/6SyJey1pfoPsj6c7Dh0+D4AAAAASUVORK5CYII="},{"name":"res/images/pic-default.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABVCAYAAAA49ahaAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAPjSURBVHgB7ZxdTttAFIVvTOA5XUHDCpqIH4mnmBUUVkBYQdlBwwpaVhBYAekKME9I/CjpCkhXUJ4hQM+lAwoo9tiG8V/OJ1lO7IkER8d3xvdeW4QQQgghhBBCCCGEJKKWZPBwOGze399/fXx8/CRzQK1W+7uwsPCr3W6PE/0uzqCzs7Pm4uJiHx99mUMg7qHneftxxbWKqoIuLS2dwJ1NmWPw/4/r9fpmHGE92wDYvzfvgipwq4a+fqyxUSfNZX8t5AWYbNnm1kinwu5bQl4xmUysmtQt5xshxwOEhFOpMLjcOzJ7Ym7YfmsTdSYq6NraWk8qzMXFRQ/C+pIC60RFkkNRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHUBRHZAqnwp2Li8vNYl7g+0P8qs3yD2OdI9qwQjlhhuZY1KJqkUw7JpT31/2KI4JBFdRR/g+htAq9u95EjutU21oycGHmE9fpsQe4auWYQIU0IKqiuxK1DBaZvtmRA7wefDw8HC6vr4+koqQtahv8XXzPE9rQmPstRPkKGmbTdEozOyvcRrhogcHX8PBJ8PhcEdKSiqn4nI90v4iI0QTe42hn+X/5NWS9+NDXF8rmmV0b9rZf4wSdRB2/vz8vGWE9rH/gq2VpnVoyr29q6urRE1ieeIkpk5NOsHzMdNC5MPlPmb+TlKRMb4Lcbcg7s+VlZV9KTCZTVQbGxtj7A7N9uRmOE9vILoSP2Q01LkIC12se3tw7ZEUkNwmKnXz6urqAbb23d3dMg4daFiJ81vTgXcI1/a1EVkKRiFmf3UxxN3DZa3ibstU2IhCQ8JkMincSqFwCRWIO8C2qe7VVYZt/JRrv0tBKGyWSt2LENGNK67GWqxvj+Faa1eeawqf+nsWFx+3Y8TcLbj2JG9hS5NP1bCgMReOtC2nWnkLW7oktfbFakiwuFaFPZacKGXmX0PC7e3tpkSvEnxMXj8kB0pbTjHLMBX2IGwMQsUeJq/Mn1sofY1K17cSISzoZx1fK1H4M8IOQk43sCTLdA1bmWoqkjS7YZOXhoEsb2crI6rWu+DI3bDzWA3sSUZUqu5vcrxh8XUnq9hauWYKfZY25FQDyZePqEpYqZyopuwdzDqHmJvJ8qqqbT9hCZiOZEAlRcVtbDDruKmbOSdt4a+jlU4pGVoXi/t3mwd+U2ETNawtx0/7MGze4O9+742AtVUp8vLHbDkQ8goUHK2aRIpqKqCBkCe0geRD3qGCoL8bt8pZZfTFNNrMEWesVdTn3GWcOlGFCeK+6UdJ9LIv02XCl30RQgghhBBCCCGEEFJ4/gEPzKMMmKSH5QAAAABJRU5ErkJggg=="},{"name":"res/images/play.png","url":"data:image/png;base64,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"},{"name":"res/images/play_music.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABJCAYAAABxcwvcAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVYSURBVHgB7VyLceM2EF15UoBSQeA0EDsNmG4gcQe5XAP2pQEpKSC6VGB3cJMGTKWBy7kBUW7Achrwy64ARjJDAARFgKTu3syaY4oglo/7wZcTSggAUz4olguWU5ZvWM7Mz6py+Zrl2cgDSyHHyWSypGODEMNyzZKzbNANcpafWBSNFRViYiMXwmgsMOTM0J3FhKAwdSsaInomp4qCZUZDAiuUGcWGhhVLRh1gQi0Bnankjd1QGCRbLVkeWT4Zeeasta7cX5HOeFKPZMALc5xSGBYsv/H9nykl5AEQZj3ihvND3yyXLy33fWD9K6SMVUbJprEnR0cmX6NHqUveUJcnliuKDei03is5NTqJnLJ8aKDXC0toeAhSZtZAiSIVOTX6ibyB3w2FqO6zH5pZkMSJ0KDatZ5lvLxrQFR3FsU3u/JUuEFME24BQ9a7BkRldCjMW9l4CDqjAcIQdQ63+0kwV9QW0K1oVwUFBt7BxC6ou55DmgftwgQXXIyZoBJ7RLk84ncKBfxxaJAuZgN2rmcjKjw+wW2egwrSTQF/MG/udnC3h25pxGD9J9BNFRvmTW7i6pPJeUUjhrGmrx3P+OS1Jo8VjWf0zwFD1CXaWpOD4Q90RIB2uxyh1gTd77FB0RHBY032LouD2ZyOEB5ruq8roGBHRkeIBtY0rRawuVpBRwxjTRsLSf+53Ik52jLXnxRHualR7hb9xjuw/FFzXsb+f3h9ZWJXq7i3kNXLFJDH5XZZDnqcuA4bigTUx8ACPbTFPC637aOKu9k6q58oLRTLXU8uuLScz+SPkKQsF/xF/eANi1jVDOmGgx9rzklcklUvW5K+sxT8m/rFnOVjAheU4P1g+U3JHyHJ9rb+of4ha5jEBT9GdkFbaNkakIukNQ0H56RdMFa8ck+BWzIbKCLgbuH7sOraBU2Gq8OL/H5C40Ppgu0H8AMxRpL28YUkCyR+/MryfXW5TjTAPtCmKBIOiEn3XeuF3ZRTbfyTa75ylO91Xr8CGY14G3F5srKc32Y9cTdbG2EIc2tb12Jyvo28fnvqqH9rSY+WCxT1C5m++iXRMj5br2PbEhdLWlsu6MOSpH22ZLlkct4mIkj6aBdUr4s2IA5OZ5agJcMHFAOWwC3jN8lnh+EeKsnKi6awz5FnFAEVkkQZWZyRPFHAM85dXndiTNoWvDOKA6lTzFRmYqS98y75EmINcbUfLb8tX/0nZo70Ltd7E8O4WlFnRaj2D43LIaXL9Q34p5RUXaHcUiBH3EGBXoDQyUlT6OZzsSa4uyL/d7W9gq4slx+TNRkrsi2OX/kKz2HH5TEQZazoZ8dzzn03cFlTgQFkpEMA/2rcZht1PNa0GLM1QbvZHdpa0d6NpoZRG27GSJSxIldyWoXeMHPcTNzxfExEYbdE2YZ2WyjgXuwuRJ2OgSg02xWwoDaA3+2KoROF2NsmTCXSW3/yEDVI14N/FwBw6AacvcokPr3ADVlpPxkKWYagaw9B8kxX1BXgzgolbtGz+xlyJEwsPLrG2WYK3X7yWVQBvf4yuVVh16sv4MecYgHaonxECaRfdJqCLITt6o67UXlPKdnm9YRmyKHf7qRrwgLJgdE5o1SAznorNEcBvTvoFWH70rDekpgZwr6LctDHE7r4DMd14H3KMXVZbvhg/l+L8Dg39u6vaPcJDhFZmpdR+Mzye9ITnH2MoWuYNxtiVanQ2QddOgN09hsCWeV3UYY5rAMdq0qymmTBz4ecOkC3l+4NWTEJy6Fb1+MdEIS2riphh5C2SU1M6+zWFtDBVFZxKHOcGlEVfdbmKJlQFi7IGiXJiOteM9UX1ONf5flou3djwdMAAAAASUVORK5CYII="},{"name":"res/images/play_video.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAM1BMVEVMaXG5ubv19fWHh4kqLDAwMjb5+fswMjYwMjalpafj4+X9/f3V1dUwMjZYWl7t7e3////ynis+AAAAEHRSTlMAcNVQPBjpMihcqfWRCjzD9taEOQAAApZJREFUeAGklAeWxCAMQwccEC1E9z/tvsRb00xm9cr0P5KweVmaQ0gJq1JKIcwvQwYs4aD0LnRWWG5l8bHWGqNfSssKfc4MaYMtlTvVZYOm8AwHQFrkhWITAOGRu7xQ5UtzWXrvItm14qlasroc7E4UF4vr2Km7EhUpY10GoBf15nAhpz5L19wWz20OiuBGUrYEziSmT3s+w1D2nybTfX3i9Z9taRIvWuQlL5r2dibjBVF5uZJsGFYjWfMV8ZPn8EDuk3jOk7p9+ki5XhEDJD7nKTEKwpEHr3kfE0l67IkzUN7jaY8FmHcFOuN8jbN2SH8D97gaf1OejP1P6LQGjhlvKsc1dPptMF8U2KfhGvMvi8ByHniqbRoNvQB/DeYzIOnzCDL/sZhWgwXnQHKRadBiUt4MISmXQI7kzhti/jTYzhpUoCq6acBi+7QIRNLdAgdyOzICmjivzw2gnTuSecsc1sTFAtq5y5o5bBV60llAO7cj/VYieiUxBGQtN0SydnxW6G2gndtriVrhEFDlZbotMeiTMaCq9DOkGgu6d24EaI2Q0+1Lmv0R8PTK0LNIuifyDKi5sZPorgCV7M+BjHsXnaz/AC6C/wHtcVSg3aF1yvsO0zjQWGkFmmNjp92NzUdt5pGEMAxFsSWr5P63pSM6X8wo3lPcXpHVwRayyMEWV88IGFdPiwOzHRTWyxezHeRLCyyzHQTWWQCzFRYgTArpFyYlbJTZGhsVRs9sjdGbKMJsTRQZwxKWNIzrVyxjnGO2YkuIcwROMVTgJBKL4SIxoV0MEdrzWtEXn76a9eWxr7d9Ae8RQQ8xeszSg6AeVfUwLcV9TPs/ILnUyDSGujF23hKMe3S/vqL71aP79nFBPH/s1PPHAQjSrRO9VuM+AAAAAElFTkSuQmCC"},{"name":"res/images/stop.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAC3HpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZdRkuMoDIbfOcUeAUkIieNgMFVzgz3+/mDa6aR7pmpn52EfYhKDhfwL9AHdCeffP0b4CxcViSGpeS45R1yppMIVDY/XddUU07pfD7z76Nke7g6GSVDL9ZjP7V9h18cLlrb9eLYHa1vHt9Du+BCUGXkG236+hYQvO+3nUPZ7NX2azv6Oxqtbj6vr9TkZktEVesKBTyGJuK8oghFIkYpacEebpyWhnbZFvs9duJsvybtbL7mLddvlORUh5u2QX3K07aTf525l6InaI/JTh8kd4mvuRvcxzmt2NWVkKoc9qY+prBYckc50ZSOjGL6Ktq1SUBxTbCDWQfNAaYEKMbI9KFGnSoPOVTdqGGLikw01c2NZNhfjwk0uBCg02ICnB3GwaqAmMPM9Flpxy4rXyBG5EzyZIEZ440sJ3xl/p9xCY8ylSxT9zhXGxXNNYxiT3LzDC0Bo7Jzqyu8q4dO6iZ/ACgjqSrNjgjUel8Sh9FhbsjgL/DSmEK+tQda3AFKE2IrBkIBAzCRKmaIxGxHy6OBTMXKWxAcIkCp3CgNsRDLgOM/YeMdo+bLyZcbRAhAqWQxosIEAKyXF+rHkWENVRVNQ1aymrkVrlpyy5pwtzzOqmlgytWxmbsWqiydXz27uXrwWLoIjTEsuFoqXUmpF0ArpircrPGo9+JAjHXrkww4/ylEblk9LTVtu1ryVVjt36dj+PXcL3Xvp9aQTS+lMp575tNPPctaBtTZkpKEjDxs+yqg3tU31mRq9kPs1NdrUJrG0/OxBDWazDwmax4lOZiDGiUDcJgEsaJ7MolNKPMlNZrEwNoUyqJFOOJ0mMRBMJ7EOutk9yP2SW9D0r7jxz8iFie5PkAsT3Sb3lds31Hpdf1FkAZq7cOY0ysDBBqfKjg/O49+vw38VeAu9hd5Cb6G30FvoLfS/EZKBfx7w2zH8A+6XkdSIS42NAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfjAxMGKw1VRLxLAAAAF0lEQVQoz2P8/5+BIGBiYBhVNKqIvooAXYgCIlGCkZwAAAAASUVORK5CYII="}],
       fonts: {"app.10":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":10,"bold":false},"app.11":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":11,"bold":false},"app.12":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":12,"bold":false},"app.12.bold":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":12,"bold":false},"app.13":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":13,"bold":false},"app.14":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":14,"bold":false},"app.14.bold":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":14,"bold":false},"app.15":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":15,"bold":false},"app.16":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":16,"bold":false},"app.16.bold":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":16,"bold":false},"app.17":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":17,"bold":false},"app.18":{"fontFamily":"Heiti SC,Heiti TC,Microsoft YaHei","size":18,"bold":false}},
       appVersion: "0.0.1.20",
       buildVersion: "20221222231256",
       styles: {},
       applicationEvents: [{"eventName":"OnCreateView","callback":"app.OnCreateView"},{"eventName":"OnExit","callback":"app.OnExit"},{"eventName":"OnStartup","callback":"app.OnStartup"},{"eventName":"OnConfigChange","callback":"app.OnConfigChange"}],
       applicationId: appKey + '_' + uniqueApplicationId,
       urlWhiteList: []
     };
   };

   /**
    * 释放资源
    * @description 使用_命名,防止被重写
    */
   ArkWindow._destroyResource_ = function () {
     ArkGlobalContext.clearTemplates();
   };

   /** 标识是Lua Ark */
   ArkWindow.isLua = true;

   async function createApp(options) {
     const lua = await luaRun();
     const templates = ArkGlobalContext.getViewTemplates();
     ArkWindow.lua = lua;
     return new arkWeb.WebARKView({
       /**
        * 这里之前是导出的唯一的对象.不过后面发现不可行.因为在Ark视图里面有注册了很多事件.这些事件的会直接调用里面声明的全局方法.这个时候就有可能不是在某一个对象上了.
        * @author alawnxu
        * @date 2022-07-30 22:41:12
        * @see
        * com.tencent.qq_vip_collect_card_template
        * <Event>
        *  <OnSetValue value="gameLogic.OnSetData" />
        * </Event>
        *
        * 而游戏中心的大部分都是:
        * com.tencent.gamecenter.gshare
        * <Event>
        *  <OnSetValue value="Vark.onSetMetaData" />
        * </Event>
        *
        * 还有多个的:
        * com.tencent.mobileqq.reading
        * <OnSetValue value="bookUpdate.OnSetMetadata" name="OnSetValue"></OnSetValue>
        * <OnSetValue value="accountChange.OnSetMetadata" name="OnSetValue"></OnSetValue>
        *
        * 而根据不同的模板调用不同的初始化方法在正常不过.所以这里统一导出ArkWindow
        */
       app: ArkWindow,
       templates,
       ...(options || {}),
     });
   }

  return createApp;

}));
