(function (global, factory) {
      // 重写factory方法.让factory有独立的作用域
      var _factory = factory; factory = function(arkWeb, wasmoon) { return function(options) { return _factory(arkWeb, wasmoon)(options); }};
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@tencent/ark-web')) :
    typeof define === 'function' && define.amd ? define(['@tencent/ark-web'], factory) :
    (global.Ark = factory(global.WebArk));
})(this, (function (arkWeb) {
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
        const apis = ["console","global","detail_1","all","app","util","report","theme","notification","view_8C8E89B49BE609866298ADDFF2DBABA4","view_95A06A1683C80BECC99BE5CC7B6D706B","view_4473A8CC09D60E4199A9EF0437B14D50","view_472ADE9D43609B0F5AB20E86B765EEA3","view_A5D6E190E8364AB2AF4BF9F53A9BE1DC"];
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

    ArkGlobalContext._setViewTemplate('detail_1', `<View id="detail_1" metadatatype="detail_1" style="display:flex;flexDirection:column;width:66vw;height:64vw;">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
	<View id="appInfoWrap" style="display:flex;justifyContent:space-between;alignItems:center;marginLeft:3.2vw;marginTop:3.2vw;marginRight:3.2vw;">
        <View id="appInfo" style="display:flex;alignItems:center;">
            <Image id="appLogo" style="display:block;width:20;height:20;flexShrink:0;marginRight:2.1333vw;" radius="3,3,3,3" value="image/icon.png"></Image>
            <Text id="appName" textcolor="0xFF878B99" font="size.14" autosize="true" ellipsis="true" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
        </View>
        <View id="appMoreInfo" style="width:4.2666vw;height:4.2666vw;flexShrink:0;">
            <Image style="display:none;" stretch="1" anchors="15" radius="3,3,3,3" value="image/more.png"></Image>
        </View>
    </View>
    <View id="appMsgTitleWrap" style="display:block;marginLeft:3.2vw;marginTop:1.6vw;marginRight:3.2vw;">
        <Text id="appMsgTitle" textcolor="0xFF03081A" font="size.17" autosize="true" ellipsis="true" value="&#x63A8;&#x8350;&#x4F60;&#x4F7F;&#x7528;&#x8FD9;&#x4E2A;&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
    </View>
    <View id="appMsgContentWrap" style="display:flex;flexDirection:column;justifyContent:center;alignItems:center;marginTop:2.1333vw;flex:1;">
        <View id="splitLine_1" style="position:absolute;left:0;top:0;right:0;height:.5;"><Texture color="0xFFEBEDF5"></Texture></View>
        <Image id="appMsgImage" style="display:block;width:64;height:64;marginBottom:11;" radius="32,32,32,32" value="image/preview.png"></Image>
        <Text id="appMsgContent" textcolor="0xFF878B99" font="size.12" autosize="true" ellipsis="true" value="&#x6765;&#x81EA;&#x597D;&#x53CB;&#x7684;&#x9080;&#x8BF7;"></Text>
    </View>
    <View id="appMsgActionWrap" style="display:flex;justifyContent:center;paddingTop:15;paddingBottom:15;">
        <View id="splitLine_2" style="position:absolute;left:0;top:0;right:0;height:.5;"><Texture color="0xFFEBEDF5"></Texture></View>
        <Text id="appMsgAction" textcolor="0xFF03081A" font="size.14" autosize="true" ellipsis="true" value="&#x5E94;&#x9080;&#x524D;&#x5F80;"></Text>
    </View>
  <View style="origin-wrap" id="originWrap">
    <Texture color="0xFFF5F6FA"></Texture>
    <View style="origin-wrap__hd">
      <Image id="footIcon" style="origin-wrap__icon" value="image/icon-miniprogram@2x.png"></Image>
    </View>
    <View style="origin-wrap__bd">
      <Text id="titleForFooter" font="size.12" ellipsis="true" textcolor="0xFF878B99" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
    </View>
  </View>
</View>

`);

    ArkGlobalContext._setViewTemplate('all', `<View id="all" metadatatype="all" style="display:flex;flexDirection:column;width:90vw;height:auto;maxHeight:10000;">
    <Event>
        <OnResize value="app.OnResize" name="OnResize"></OnResize>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
    </Event>    
    <Texture color="0xFFFFFFFF"></Texture>
	<View id="appMsgTitleWrap" style="display:flex;alignItems:center;height:15vw;padding:0 3.2vw 0 3.2vw;">
        <Text id="appMsgTitle" textcolor="0xFF03081A" font="bold.17" autosize="true" ellipsis="true" value="&#x6D88;&#x606F;&#x6807;&#x9898;"></Text>
    </View>
    <View id="appMsgImageWrap" style="display:flex;paddingTop:50%;">
        <Texture color="0xFFF5F6FA"></Texture>
        <Image id="appMsgImage" style="display:block;position:absolute;left:0;top:0;right:0;bottom:0;" value="image/preview.png"></Image>
    </View>
    <View id="appMsgTextWrap" style="display:flex;flexDirection:column;padding:3.2vw;">
        <Text id="appMsgText" style="flexGrow:1;" textcolor="0xFF03081A" font="size.14" multiline="true" autosize="true" ellipsis="true" value="&#x8FD9;&#x662F;&#x4E00;&#x6BB5;&#x4E1A;&#x52A1;&#x5907;&#x6CE8;&#x6587;&#x5B57;&#xFF0C;&#x53EF;&#x5C55;&#x793A;&#x591A;&#x884C;&#xFF0C;&#x53EF;&#x4E0D;&#x5C55;&#x793A;&#x3002;&#x8FD9;&#x662F;&#x4E00;&#x6BB5;&#x4E1A;&#x52A1;&#x5907;&#x6CE8;&#x6587;&#x5B57;"></Text>
    </View>
    <View id="appMsgActionWrap" style="display:flex;justifyContent:center;padding:4vw 0 4vw 0;">
        <View id="splitLine" style="position:absolute;left:0;top:0;right:0;height:.5;"><Texture color="0xFFEBEDF5"></Texture></View>
        <Text id="appMsgAction" textcolor="0xFF03081A" font="bold.17" autosize="true" ellipsis="true" value="&#x6309;&#x94AE;&#x6587;&#x672C;"></Text>
    </View>
</View>

`);

    ArkGlobalContext._setViewTemplate('notification', `<View id="notification" metadatatype="notification" style="display:flex;flexDirection:column;width:345;height:auto;maxHeight:10000;justifyContent:flex-start;">
	<Event>
		<OnResize value="app.OnResize" name="OnResize"></OnResize>
        
        <OnStartup value="app.OnStartup" name="OnStartup"></OnStartup>
        <OnConfigChange value="app.OnConfigChange" name="OnConfigChange"></OnConfigChange>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
	</Event>
    <Texture id="bgColor" color="0xFFFFFFFF"></Texture>
    <View id="appInfoWrap" style="display:flex;alignItems:flex-start;margin:4vw;">
        <Image id="appLogo" style="display:block;width:50;height:50;flexShrink:0;" radius="10,10,10,10" value="https://placehold.it/100"></Image>
        <View id="appInfo" style="display:flex;flexDirection:column;height:50;justifyContent:space-between;margin:0 1.2vw 0 4vw;">
            <Text id="appEvent" textcolor="0xFF03081A" font="bold.17" autosize="true" ellipsis="true" value="&#x521D;&#x59CB;&#x6807;&#x9898;"></Text>
            <Text id="appName" textcolor="0xFF878B99" font="size.14" autosize="true" ellipsis="true" value="&#x5C0F;&#x7A0B;&#x5E8F;&#x521D;&#x59CB;&#x6807;&#x9898;"></Text>
        </View>
    </View>
    <View id="appMsgContentWrap" style="display:flex;flexDirection:column;justifyContent:center;alignItems:center;padding:4vw;">

        <View id="splitLine" style="position:absolute;left:0;top:0;right:0;height:.3333;"><Texture color="0xFFEBEDF5"></Texture></View>

        <View id="appMsgContent" style="display:flex;flexDirection:column;justifyContent:center;alignItems:center;flex:1;">

            <Text id="appMsgType" style="marginTop:9.333vw;" textcolor="0xFF878B99" font="size.14" autosize="true" ellipsis="true" value="&#x521D;&#x59CB;&#x798F;&#x5229;&#x5185;&#x5BB9;"></Text>
            <View id="appMsgText" style="display:flex;justifyContent:center;alignItems:center;marginTop:1.333vw;marginBottom:13.333vw;">
                <Text id="appMsgTxt" style="flexGrow:1" textcolor="0xFF03081A" align="1" font="size.30" autosize="true" multiline="true" value="&#x4E03;&#x5929;&#x8FDE;&#x7EED;&#x767B;&#x5F55;&#x9001;&#x5343;&#x5143;&#x7EA7;&#x795E;&#x5175;&#x5957;&#x88C5;"></Text>
            </View>

            <View id="splitLine" style="position:absolute;left:0;bottom:0;right:0;height:.3333;"><Texture color="0xFFEBEDF5"></Texture></View>
        </View>
        


        <View id="appMsgDetail" style="display:flex;flexDirection:column;width:100%;marginTop:1vw;">
        </View>
        <View id="splitLine" style="position:absolute;left:0;bottom:0;right:0;height:.3333;"><Texture color="0xFFEBEDF5"></Texture></View>
    </View>
    <View id="appMsgActionWrap" style="display:flex;justifyContent:center;paddingTop:15;paddingBottom:15;">
        <Text id="appMsgAction2" style="flex:1" align="1" textcolor="0xFF616573" font="bold.17" autosize="true" ellipsis="true" value="&#x62D2;&#x6536;&#x901A;&#x77E5;"></Text>
        <Text id="appMsgAction1" style="flex:1" align="1" textcolor="0xFF03081A" font="bold.17" autosize="true" ellipsis="true" value="&#x67E5;&#x770B;&#x8BE6;&#x60C5;"></Text>

    </View>
</View>`);

    ArkGlobalContext._setViewTemplate('view_8C8E89B49BE609866298ADDFF2DBABA4', `

<View id="view_8C8E89B49BE609866298ADDFF2DBABA4" metadatatype="detail_1" style="display:flex;flexDirection:row;width:100vw;height:auto;maxHeight:1000;">
  <Event>
    <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    <OnResize value="app.OnResize" name="OnResize"></OnResize>
  </Event>

  <Texture color="0xFFEAEDF4"></Texture>

  <View style="width:4;height:auto;" id="blueBar">
    <Texture color="0xFFEAEDF4" id="blueBarTexture"></Texture>
  </View>

  <View style="display:flex;flexDirection:column;width:100vw;height:auto;">

    <View style="display:flex;flexDirection:column;" id="titleView">
      <Texture color="0xFFFFFFFF" id="titleTexture"></Texture>

      <View id="titleContainer" style="display:flex;flexDirection:row;alignItems:center;width:auto;height:auto">
        <View style="margin:8 0 0 12;display:flex;width:18;height:18;" radius="4,4,4,4">
          <Image id="icon" value="image/icon.png" mode="aspectfit" style="width:100%;height:100%"></Image>
        </View>
        <Text id="title" font="size.14" style="width:100%;height:21;margin:12 0 0 5;" ellipsis="true" textcolor="0xffB2B2B2" value="&#x5E94;&#x7528;&#x540D;&#x79F0;"></Text>
      </View>

      
      <View style="display:flex;flexDirection:column;marginLeft:7;marginBottom:2;">

        <Text id="desc" style="display:block;height:auto;" align="4" font="size.17" autosize="true" value="&#x63A8;&#x8350;&#x4F60;&#x4F7F;&#x7528;&#x8FD9;&#x4E2A;&#x5C0F;&#x7A0B;&#x5E8F;" ellipsis="true" multiline="true" textcolor="0xFF222222"></Text>
      </View>
    </View>

    <View style="display:flex;flexDirection:row;width:auto;height:auto;">
      <View style="display:block;width:auto;padding:0 10 10 10;" id="previewView">
        <Texture color="0xFFFFFFFF" id="previewTexture"></Texture>
        <View style="display:block;width:100%;height:185;" id="previewPic">
          <Image id="preview" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" radius="4, 4, 4, 4" mode="aspectfill" value="image/preview.png"></Image>
        </View>
      </View>
    </View>

    <View id="buttonWrap" style="display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingBottom:10;">
      <Texture color="0xFFFFFFFF" id="buttonTexture"></Texture>
      <View style="flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:5;paddingBottom:10;">
        <Text id="buttonText" font="size.17" ellipsis="true" align="5" textcolor="0xff03081A" value="&#x6309;&#x94AE;1"></Text>
      </View>
    </View>

    <View style="display:flex;flexDirection:row;alignItems:center;height:30;" id="originWrap">
      <View style="display:block;height:0.5;position:absolute;top:0;left:10;right:10;">
        <Image style="width:100%;height:0.5;" value="image/lineBg.png"></Image>
      </View>
      <Texture color="0xFFFFFFFF" id="originTexture"></Texture>
      <View style="display:flex;height:15;width:15;marginLeft:15;" id="miniappIcon">
        <Image id="footIcon" style="origin-wrap__icon" value="image/icon-miniprogram@2x.png"></Image>
      </View>
      <View style="display:flex;height:15;width:15;marginLeft:15;" id="wxMiniappIcon">
        <Image style="origin-wrap__icon" value="image/wxMiniappIcon.png"></Image>
      </View>
      <View style="display:flex;flex:1;paddingLeft:12;" id="footerTitle">
        <Text id="titleForFooter" font="size.12" ellipsis="true" textcolor="0xFFB2B2B2" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
      </View>
    </View>

    
    <View id="littleTail" style="display:flex;flexDirection:column;justifyContent:center;alignItems:center;height:10vw;">
      <Texture color="0xFFEAEDF4"></Texture>
      <View style="display:flex;flexDirection:row;alignItems:center;height:10vw;marginTop:2.2vw;width:100%;" radius="16,16,16,16" alpha="185">
        <Texture color="0xFFCBCED6"></Texture>
        <Image style="width:4vw;height:4vw;marginLeft:3.2vw;marginRight:1vw;" value="image/integral_icon.png"></Image>
        <Text font="size.12" ellipsis="true" textcolor="0xFFFFFFFF" value="&#x79EF;&#x5206;"></Text>
        <Text id="gamePointsText" style="marginLeft:3vw;" font="size.12" ellipsis="true" textcolor="0xFFFFFFFF" value="&#x4F60;&#x6709;&#x4E00;&#x4E2A;60&#x79EF;&#x5206;&#x793C;&#x5305;&#x5F85;&#x9886;&#x53D6;"></Text>
        <Image style="width:3vw;height:3vw;marginLeft:1vw;" value="image/next.png"></Image>
      </View>
    </View>

  </View>

</View>
`);

    ArkGlobalContext._setViewTemplate('view_95A06A1683C80BECC99BE5CC7B6D706B', `

<View id="view_95A06A1683C80BECC99BE5CC7B6D706B" metadatatype="invitation_1" style="display:flex;flexDirection:column;width:66vw;height:auto;maxHeight:1000;">
  <Event>
    <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    <OnResize value="app.OnResize" name="OnResize"></OnResize>
    <OnClick value="app.OnClick" name="OnClick"></OnClick>
  </Event>
  <Texture color=""></Texture>

  <View style="display:flex;flexDirection:column;" id="titleWrap">
    <Texture color="0xFFFFFFFF" id="titleWrapTexture"></Texture>

    <View style="display:flex;flexDirection:row;alignItems:center;width:auto;height:auto;">
      <View style="margin:10 0 0 10;display:flex;width:21;height:21;" radius="4,4,4,4">
        <Image id="icon" value="image/icon.png" mode="aspectfit" style="width:100%;height:100%"></Image>
      </View>
      <Text id="name" font="size.14" style="width:100%;height:21;margin:14 0 0 8;" ellipsis="true" textcolor="0xff878B99" value=""></Text>
    </View>

    <!--
      单行 6.4vw / 两行 12.8vw
      Android 23.x / 46.x
      iOS 24 / 48
    -->
    <Text id="title" style="display:block;height:auto;margin:5 10 8 10;" align="4" font="size.17" autosize="true" value="" ellipsis="true" multiline="true" textcolor="0xFF03081A"></Text>
  </View>

  <View style="display:block;width:auto;padding:0 10 0 10;" id="previewWrap">
    <Texture color="0xFFFFFFFF" id="previewWrapTexture"></Texture>
    <View style="display:block;width:100%;paddingTop:57%;" radius="3, 3, 3, 3">
      <Image id="imageUrl" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" mode="aspectfit" value=""></Image>
    </View>
  </View>

  <View style="display:flex;flexDirection:row;alignItems:center;justifyContent:center;" id="buttonContain">
    <Texture color="0xFFFFFFFF" id="buttonContainTexture"></Texture>
    <View id="buttonWrap" style="flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:14;paddingBottom:14;">
      <Text id="bottomBtnTxt" font="bold.17" ellipsis="true" align="5" textcolor="0xff4D94FF" value=""></Text>
    </View>
  </View>

  <View style="origin-wrap" id="footer">
    <Texture color="0xFFF5F6FA" id="footerTexture"></Texture>
    <View style="origin-wrap__hd">
      <Image id="footIcon" style="origin-wrap__icon" value="image/icon-miniprogram@2x.png"></Image>
    </View>
    <View style="origin-wrap__bd">
      <Text id="footerTitle" font="size.12" ellipsis="true" textcolor="0xFF878B99" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
    </View>
  </View>
</View>`);

    ArkGlobalContext._setViewTemplate('view_4473A8CC09D60E4199A9EF0437B14D50', `

<View id="view_4473A8CC09D60E4199A9EF0437B14D50" metadatatype="invitation_2" style="display:flex;flexDirection:column;width:66vw;height:auto;maxHeight:1000;">
  <Event>
    <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    <OnResize value="app.OnResize" name="OnResize"></OnResize>
    <OnClick value="app.OnClick" name="OnClick"></OnClick>
  </Event>
  <Texture color=""></Texture>

  <View style="display:flex;flexDirection:column;" id="titleWrap">
    <Texture color="0xFFFFFFFF" id="titleWrapTexture"></Texture>

    <View style="display:flex;flexDirection:row;alignItems:center;width:auto;height:auto;">
      <View style="margin:10 0 0 10;display:flex;width:21;height:21;" radius="4,4,4,4">
        <Image id="icon" value="image/icon.png" mode="aspectfit" style="width:100%;height:100%"></Image>
      </View>
      <Text id="name" font="size.14" style="width:100%;height:21;margin:14 0 0 8;" ellipsis="true" textcolor="0xff878B99" value="&#x5E94;&#x7528;&#x540D;&#x79F0;"></Text>
    </View>

    
    <Text id="title" style="display:block;height:auto;margin:5 10 8 10;" align="4" font="size.17" autosize="true" value="&#x63A8;&#x8350;&#x4F60;&#x4F7F;&#x7528;&#x8FD9;&#x4E2A;&#x5C0F;&#x7A0B;&#x5E8F;" ellipsis="true" multiline="true" textcolor="0xFF03081A"></Text>
  </View>


  <View style="display:block;width:auto;padding:0 10 0 10;" id="previewWrap">
    <Texture color="0xFFFFFFFF" id="previewWrapTexture"></Texture>
    <View style="display:block;width:100%;paddingTop:57%;" radius="3, 3, 3, 3">
       <Image id="imageUrl" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" mode="aspectfill" value=""></Image>
       <Image id="mask" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" mode="aspectfill" value="image/invitationBgMask.png"></Image>
       <Image id="achieve" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" mode="aspectfill" value="image/invitationAchieveBg.png"></Image>

       <View style="position:absolute;top:0;left:0;bottom:0;right:0;display:flex;flexDirection:row;justifyContent:center;alignItems:center;width:100%;">
            <Text id="achieveText" font="bold.60" ellipsis="true" align="8" textcolor="0xffFFFFFF" value="16"></Text>
            <Text id="achieveUnit" font="size.25" ellipsis="true" align="8" style="height:60;marginBottom:10;marginLeft:2;" textcolor="0xffFFFFFF" value=""></Text>
       </View>
    </View>
  </View>

  <View style="display:flex;flexDirection:row;alignItems:center;justifyContent:center;" id="buttonContain">
    <Texture color="0xFFFFFFFF" id="buttonContainTexture"></Texture>
    <View id="buttonWrap" style="flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:14;paddingBottom:14;">
      <Text id="bottomBtnTxt" font="bold.17" ellipsis="true" align="5" textcolor="0xff4D94FF" value=""></Text>
    </View>
  </View>

  <View style="origin-wrap" id="footer">
    <Texture color="0xFFF5F6FA" id="footerTexture"></Texture>
    <View style="origin-wrap__hd">
      <Image id="footIcon" style="origin-wrap__icon" value="image/icon-miniprogram@2x.png"></Image>
    </View>
    <View style="origin-wrap__bd">
      <Text id="footerTitle" font="size.12" ellipsis="true" textcolor="0xFF878B99" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
    </View>
  </View>
</View>`);

    ArkGlobalContext._setViewTemplate('view_472ADE9D43609B0F5AB20E86B765EEA3', `

<View id="view_472ADE9D43609B0F5AB20E86B765EEA3" metadatatype="invitation_3" style="display:flex;flexDirection:column;width:66vw;height:auto;maxHeight:1000;">
  <Event>
    <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
    <OnResize value="app.OnResize" name="OnResize"></OnResize>
    <OnClick value="app.OnClick" name="OnClick"></OnClick>
  </Event>
  <Texture color=""></Texture>

  <View style="display:flex;flexDirection:column;" id="titleWrap">
    <Texture color="0xFFFFFFFF" id="titleWrapTexture"></Texture>

    <View style="display:flex;flexDirection:row;alignItems:center;width:auto;height:auto;">
      <View style="margin:10 0 0 10;display:flex;width:21;height:21;" radius="4,4,4,4">
        <Image id="icon" value="image/icon.png" mode="aspectfit" style="width:100%;height:100%"></Image>
      </View>
      <Text id="name" font="size.14" style="width:100%;height:21;margin:14 0 0 8;" ellipsis="true" textcolor="0xff878B99" value="&#x5E94;&#x7528;&#x540D;&#x79F0;"></Text>
    </View>

    
    <Text id="title" style="display:block;height:auto;margin:5 10 8 10;" align="4" font="size.17" autosize="true" value="" ellipsis="true" multiline="true" textcolor="0xFF03081A"></Text>
  </View>

 <View style="display:block;width:auto;padding:0 10 0 10;" id="previewWrap">
    <Texture color="0xFFFFFFFF" id="previewWrapTexture"></Texture>
    <View style="display:block;width:100%;paddingTop:57%;" radius="3, 3, 3, 3">
       <Image id="imageUrl" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" mode="aspectfill" value=""></Image>
       <Image id="mask" style="display:block;position:absolute;top:0;left:0;bottom:0;right:0;" mode="aspectfill" value="image/invitationBgMask.png"></Image>

       <View style="position:absolute;top:55%;display:flex;flexDirection:row;justifyContent:space-around;align-items:center;width:100%;">
           <View id="gift1" style="display:flex;flexDirection:column;alignItems:center;">
               <View style="display:block;width:60;">
                    <Texture value="image/invitationGiftFrame.png"></Texture>
                    <Image id="gift1Img" style="width:44;margin:8" radius="10, 10, 10, 10" value=""></Image>
               </View>
               <Text id="gift1Text" style="display:block;marginTop:2;" font="bold.12" ellipsis="true" textcolor="0xffFFFFFF" value=""></Text>
           </View>
            <View id="gift2" style="display:flex;flexDirection:column;alignItems:center;">
               <View style="display:block;width:60;">
                    <Texture value="image/invitationGiftFrame.png"></Texture>
                    <Image id="gift2Img" style="width:44;margin:8" radius="10, 10, 10, 10" value=""></Image>
               </View>
               <Text id="gift2Text" style="display:block;marginTop:2;" font="bold.12" ellipsis="true" textcolor="0xffFFFFFF" value=""></Text>
           </View>
           <View id="gift3" style="display:flex;flexDirection:column;alignItems:center;">
               <View style="display:block;width:60;">
                    <Texture value="image/invitationGiftFrame.png"></Texture>
                    <Image id="gift3Img" style="width:44;margin:8" radius="10, 10, 10, 10" value=""></Image>
               </View>
               <Text id="gift3Text" style="display:block;marginTop:2;" font="bold.12" ellipsis="true" textcolor="0xffFFFFFF" value=""></Text>
           </View>
       </View>
    </View>
  </View>

  <View style="display:flex;flexDirection:row;alignItems:center;justifyContent:center;" id="buttonContain">
    <Texture color="0xFFFFFFFF" id="buttonContainTexture"></Texture>
    <View id="buttonWrap" style="flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:14;paddingBottom:14;">
      <Text id="bottomBtnTxt" font="bold.17" ellipsis="true" align="5" textcolor="0xff4D94FF" value=""></Text>
    </View>
  </View>

  <View style="origin-wrap" id="footer">
    <Texture color="0xFFF5F6FA" id="footerTexture"></Texture>
    <View style="origin-wrap__hd">
      <Image id="footIcon" style="origin-wrap__icon" value="image/icon-miniprogram@2x.png"></Image>
    </View>
    <View style="origin-wrap__bd">
      <Text id="footerTitle" font="size.12" ellipsis="true" textcolor="0xFF878B99" value="QQ&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
    </View>
  </View>


</View>`);

    ArkGlobalContext._setViewTemplate('view_A5D6E190E8364AB2AF4BF9F53A9BE1DC', `

<View id="view_A5D6E190E8364AB2AF4BF9F53A9BE1DC" metadatatype="invitation_gshop" style="display:flex;flexDirection:column;width:66vw;height:auto;maxHeight:1000;">
    <Event>
        <OnSetValue value="app.OnSetValue" name="OnSetValue"></OnSetValue>
        <OnResize value="app.OnResize" name="OnResize"></OnResize>
        <OnClick value="app.OnClick" name="OnClick"></OnClick>
    </Event>

    <View style="display:block;width:auto;padding:0 10 0 10;">
        <Texture color="0xFFFFFFFF"></Texture>
        <View style="display:flex;flexDirection:column;justifyContent:center;alignItems:center;width:100%;">
            <View id="item-0" style="display:flex;flexDirection:row;alignItems:center;justifyContent:space-between;marginTop:10;">
                <View style="display:block;width:70;marginRight:8">
                    <Image id="item-0-image" style="width:70;height:70" radius="4, 4, 4, 4" value=""></Image>
                </View>
                <View id="item-0-text" style="display:flex;flexDirection:column;justifyContent:space-around;flex:1;height:70">
                    <Text id="item-0-title" font="bold.14" multiline="true" maxline="2" ellipsis="true" lineheight="16" textcolor="0xFF03081A" value=""></Text>
                    <Text id="item-0-sales" font="size.12" textcolor="0xFF878B99" value=""></Text>
                    <View id="price" anchors="8" style="display:flex;alignItems:center;" value="">
                        <Text id="item-0-price" font="bold.14" textcolor="0xFF00CAFC" style="marginRight:10" value=""></Text>
                        <Text id="item-0-oprice" font="size.12" textcolor="0xFF878B99" value=""></Text>
                    </View>
                </View>
            </View>
            <View id="item-1" style="display:flex;flexDirection:row;alignItems:center;justifyContent:space-between;marginTop:10;">
                <View style="display:block;width:70;marginRight:8">
                    <Image id="item-1-image" style="width:70;height:70" radius="4, 4, 4, 4" value=""></Image>
                </View>
                <View id="item-1-text" style="display:flex;flexDirection:column;justifyContent:space-around;flex:1;height:70">
                    <Text id="item-1-title" font="bold.14" multiline="true" maxline="2" ellipsis="true" lineheight="16" textcolor="0xFF03081A" value=""></Text>
                    <Text id="item-1-sales" font="12" textcolor="0xFF878B99" value=""></Text>
                    <View id="price" anchors="8" style="display:flex;alignItems:center;" value="">
                        <Text id="item-1-price" font="bold.14" textcolor="0xFF00CAFC" style="marginRight:10" value=""></Text>
                        <Text id="item-1-oprice" font="size.12" textcolor="0xFF878B99" value=""></Text>
                    </View>
                </View>
            </View>
            <View id="item-2" style="display:flex;flexDirection:row;alignItems:center;justifyContent:space-between;marginTop:10;">
                <View style="display:block;width:70;marginRight:8">
                    <Image id="item-2-image" style="width:70;height:70" radius="4, 4, 4, 4" value=""></Image>
                </View>
                <View id="item-2-text" style="display:flex;flexDirection:column;justifyContent:space-around;flex:1;height:70">
                    <Text id="item-2-title" font="bold.14" multiline="true" maxline="2" ellipsis="true" lineheight="16" textcolor="0xFF03081A" value=""></Text>
                    <Text id="item-2-sales" font="12" textcolor="0xFF878B99" value=""></Text>
                    <View id="price" anchors="8" style="display:flex;alignItems:center;" value="">
                        <Text id="item-2-price" font="bold.14" textcolor="0xFF00CAFC" style="marginRight:10" value=""></Text>
                        <Text id="item-2-oprice" font="size.12" textcolor="0xFF878B99" value=""></Text>
                    </View>
                </View>
            </View>
        </View>
    </View>

    <View style="display:flex;flexDirection:row;alignItems:center;justifyContent:center;">
        <Texture color="0xFFFFFFFF"></Texture>
        <View id="buttonWrap" style="flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:14;paddingBottom:14;">
            <Text id="bottomBtnTxt" font="bold.17" ellipsis="true" align="5" textcolor="0xff4D94FF" value=""></Text>
        </View>
    </View>

    <View style="origin-wrap">
        <Texture color="0xFFF5F6FA"></Texture>
        <View style="origin-wrap__hd">
            <Image style="origin-wrap__icon" value="image/icon-miniprogram@2x.png"></Image>
        </View>
        <View style="origin-wrap__bd">
            <Text id="name" font="size.12" ellipsis="true" textcolor="0xFF878B99" value="&#x5C0F;&#x7A0B;&#x5E8F;"></Text>
        </View>
    </View>


</View>`);

    ArkWindow.console = {
        MAX_LOG_DEPTH: 10,
        _log: function(arg, depth) {
            var res = [];
            var type = typeof arg;
            if (type == 'object') {
                var keyLen = 0;
                for (var key in arg) {
                    keyLen = keyLen + 1;
                }
                if (keyLen == 0) {
                    res.push(ArkWindow.console._toString(arg));
                } else {
                    var tmp = [];
                    for (var i = 0; i < depth; ++i) {
                        tmp.push('    ');
                    }
                    tmp = tmp.join('');
                    var tmp1 = tmp + '    ';
                    res.push('{');
                    var i = 0;
                    for (var key in arg) {
                        res.push('\n' + tmp1 + key + ' : ');
                        if (depth >= ArkWindow.console.MAX_LOG_DEPTH) {
                            res.push(ArkWindow.console._toString(arg[key]));
                        } else {
                            res.push(ArkWindow.console._log(arg[key], depth + 1));
                        }
                        i = i + 1;
                        if (i < keyLen) {
                            res.push(',');
                        }

                    }
                    res.push('\n' + tmp + '}');
                }

            } else {
                res.push(ArkWindow.console._toString(arg));
            }
            return res.join('');
        },
        _toString: function(arg) {
            var type = Object.prototype.toString.call(arg);
            if (type == '[object Null]') {
                return 'Null';
            } else if (type == '[object Undefined]') {
                return 'Undefined';
            } else if (type == '[object Number]' || type == '[object String]' || type == '[object Boolean]') {
                return arg;
            } else if (arg && arg.toString && typeof arg.toString == 'function') {
                return arg.toString();
            } else {
                return 'Unknow Type';
            }
        },
        log: function() {
            var res = [];
            for (var i = 0; i < arguments.length; ++i) {
                res.push(ArkWindow.console._log(arguments[i], 0));
            }
            arkWeb.Console.Log('[log]:');
            arkWeb.Console.Log(res.join('\n'));
        },
        warn: function() {
            var res = [];
            for (var i = 0; i < arguments.length; ++i) {
                res.push(ArkWindow.console._log(arguments[i], 0));
            }
            arkWeb.Console.Log('[warn]:');
            arkWeb.Console.Log(res.join('\n'));
        },
        error: function() {
            var res = [];
            for (var i = 0; i < arguments.length; ++i) {
                res.push(ArkWindow.console._log(arguments[i], 0));
            }
            arkWeb.Console.Log('[error]:');
            arkWeb.Console.Log(res.join('\n'));
        }
    };

    var global$7 = ArkWindow;

    ArkWindow.detail_1 = {
        ViewModel: {
            New: function(view) {
                var model = Object.create(this);
                model.Initialize(view);
                return model;
            },
            Initialize: function(view) {
                ArkWindow.console.log('detail_1 Initialize');
                this.view = view;
                //兜底数据
                this.metaData = {
                    'title': 'QQ小程序',
                    'desc': '推荐你使用这个小程序',
                    'icon': 'image/icon.png',
                    'preview': 'image/preview.png',
                    'url': 'www.qq.com',
                    "appType": 0, // 0 小程序， 1 小游戏
                    "scene": 0,
                    "host": {
                        "uin": 0,
                        "nick": "昵称"
                    },
                    "shareTemplateId": "123",
                    "shareTemplateData": {
                        "txt1": "来自好友的邀请",
                        "txt2": "应邀前往"
                    }
                };
                this.appInfoWrapUIObj = view.GetUIObject("appInfoWrap");
                this.originWrapUIObj = view.GetUIObject("originWrap");
                this.titleForFooterUIObj = view.GetUIObject("titleForFooter");
                this.footIconUIObj = view.GetUIObject("footIcon");

                this.appLogoView = view.GetUIObject("appLogo");
                this.appNameView = view.GetUIObject("appName");
                this.appMsgTitleView = view.GetUIObject("appMsgTitle");
                this.appMsgImageView = view.GetUIObject("appMsgImage");
                this.appMsgContent = view.GetUIObject("appMsgContent");
                this.appMsgAction = view.GetUIObject("appMsgAction");
                this.splitLine_1 = view.GetUIObject("splitLine_1");
                this.splitLine_2 = view.GetUIObject("splitLine_2");

                var viewSize = this.view.GetSize();
                this.OnResize(viewSize.width, viewSize.height);
                // 绑定点击事件
                var self = this;
                this.appInfoWrapUIObj.AttachEvent("OnClick", function() {
                    self.OnClick();
                });
                this.originWrapUIObj.AttachEvent("OnClick", function() {
                    self.clickOriginWrapUI();
                });
            },
            Deinitialize: function() {
                ArkWindow.console.log('detail_1 Deinitialize');
            },
            OnResize: function(width, height) {
                ArkWindow.console.log('detail_1 Deinitialize');
                this.Update();
            },
            OnSetValue: function(sender, value) {
                ArkWindow.console.log('OnSetValue', value);
                var self = this;
                this.metaData = value.detail_1 || this.metaData;
                this.metaData.host.avatar = ArkWindow.util.getAvatar(this.metaData.host.uin, 100, 'qq');
                this.Update();
                // 曝光上报
                var compassData = {
                    uin: self.metaData.host && this.metaData.host.uin || "",
                    appid: self.metaData.appid,
                    refer: self.metaData.scene,
                    actiontype: "ark",
                    sub_actiontype: "ark_share",
                    reserves_action: "expo",
                    reserves2: "com.tencent.miniapp_01",
                    reserves3: "detail_1",
                    reserves4: "",
                    reserves5: ArkWindow.util.getContainerInfo(self.view).group ? "group" : "c2c"
                };
                ArkWindow.report.compass(compassData, "dc04239");
            },
            OnClick: function(sender, x, y, button, keyState) {
                var self = this;
                ArkWindow.console.log('detail_1 OnClick');
                //上报到ark表
                ArkWindow.util.Report(this.view.GetRoot().GetID(), 3, "Button.OnClick");
                var url = this.metaData["url"];
                url = ArkWindow.util.fixurl(url);
                url = ArkWindow.util.getMiniAppUrl(url, self.metaData["scene"], self.view);
                ArkWindow.console.log("OpenUrl url:", url);
                ArkWindow.console.log("befor OpenUrl");
                arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                ArkWindow.console.log("after OpenUrl");
                // 点击上报
                var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                var compassData = {
                    uin: self.metaData.host && this.metaData.host.uin || "",
                    appid: self.metaData.appid,
                    refer: self.metaData.scene,
                    actiontype: "ark",
                    sub_actiontype: "ark_share",
                    reserves_action: "click",
                    reserves2: "com.tencent.miniapp_01",
                    reserves3: "detail_1",
                    reserves4: "",
                    reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                    app_type: this.metaData.appType || 0,
                };
                ArkWindow.report.compass(compassData, "dc04239");
            },
            clickOriginWrapUI: function() {
                ArkWindow.console.log("clickOriginWrapUI");
                ArkWindow.console.log(this.metaData.appType);
                if (Number(this.metaData.appType) === 0 || !this.metaData.appType) {
                    this.OnClick();
                    return;
                }
                var url = "mqqapi://hippy/open?bundleName=miniGameCenter";
                arkWeb.QQ.OpenUrl(url, this.view.GetRoot());

                // 点击上报
                var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                var compassData = {
                    uin: this.metaData.host && this.metaData.host.uin || "",
                    appid: this.metaData.appid,
                    refer: this.metaData.scene,
                    actiontype: "ark",
                    sub_actiontype: "ark_share",
                    reserves_action: "click_minigamestore",
                    reserves2: "com.tencent.miniapp_01",
                    reserves3: appView,
                    reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                    touin: containerInfo.chatUIN,
                    app_type: this.metaData.appType || 0,
                };
                ArkWindow.report.compass(compassData, "dc04239");
            },
            /*resize和setvalue同意调用update，更新视图*/
            Update: function() {
                if (this.metaData.icon) {
                    ArkWindow.util.setImage(this.metaData.icon, this.appLogoView, function(err) {
                        if (err) {
                            ArkWindow.console.error('set Image error', err);
                        }
                    });
                }

                this.appNameView.SetValue(this.metaData.title);
                this.appMsgTitleView.SetValue(this.metaData.desc);
                if (this.metaData.host.avatar) {
                    ArkWindow.util.setImage(this.metaData.host.avatar, this.appMsgImageView, function(err) {
                        if (err) {
                            ArkWindow.console.error('set Image error', err);
                        }
                    });
                }

                this.appMsgContent.SetValue(this.metaData.shareTemplateData.txt1);
                this.appMsgAction.SetValue(this.metaData.shareTemplateData.txt2);
                this.titleForFooterUIObj.SetValue(ArkWindow.util.getFootTitleByAppType(this.metaData.appType));
                this.footIconUIObj.SetValue(ArkWindow.util.getFootIconByAppType(this.metaData.appType));
                if (global$7.Device && global$7.Device.GetPixelRatio) {
                    var radio = global$7.Device.GetPixelRatio();
                    ArkWindow.console.log('radio:', radio);
                    var height = (1 / radio).toFixed(4);
                    /*重构说，样式的height 是 1 / radio 取小数点4位*/
                    this.splitLine_1.SetStyle("position:absolute;left:0;top:0;right:0;height:" + height + ";");
                    this.splitLine_2.SetStyle("position:absolute;left:0;top:0;right:0;height:" + height + ";");
                }


            }
        }
    };

    ArkWindow.global = global$7;

    ArkWindow.all = {
        ViewModel: {
            New: function(view) {
                var model = Object.create(this);
                model.Initialize(view);
                return model;
            },
            Initialize: function(view) {
                this.view = view;
                //兜底数据
                this.metaData = {
                    'title': 'QQ小程序',
                    'summary': '推荐你使用这个小程序',
                    'preview': 'image/preview.png',
                    'jumpUrl': 'https://www.qq.com',
                    "buttonText": "开始游戏",
                    "buttonAction": "https://www.qq.com",
                    "appid": ""
                };
                this.titleUIObj = view.GetUIObject("appMsgTitle");
                this.summaryUIObj = view.GetUIObject("appMsgText");
                this.previewUIObj = view.GetUIObject("appMsgImage");
                this.buttonUIObj = view.GetUIObject("appMsgAction");

                var viewSize = this.view.GetSize();
                this.OnResize(viewSize.width, viewSize.height);
                this.Update();
            },
            Deinitialize: function() {},
            OnResize: function(width, height) {
                this.Update();
            },
            OnSetValue: function(sender, value) {
                ArkWindow.console.log('OnSetValue', value);
                if (value.all) {
                    this.metaData.title = value.all.title;
                    this.metaData.summary = value.all.summary;
                    this.metaData.preview = value.all.preview;
                    this.metaData.jumpUrl = value.all.jumpUrl;
                    this.metaData.appid = value.all.appid;
                    this.metaData.buttonText = value.all.buttons[0].name;
                    this.metaData.buttonAction = value.all.buttons[0].action;
                }

                this.Update();
                this.report({
                    table: 'dc04239',
                    application: 'com.tencent.miniapp',
                    view: 'all',
                    type: 1,
                    action: 'expo'
                });
            },
            OnClick: function(sender, x, y, button, keyState) {
                var self = this;
                var url = this.metaData.jumpUrl;
                ArkWindow.console.log("OpenUrl url:", url);
                this.report({
                    table: 'dc04239',
                    application: 'com.tencent.miniapp',
                    view: 'all',
                    type: 2,
                    action: 'click'
                });
                arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
            },
            /*resize和setvalue同意调用update，更新视图*/
            Update: function() {
                if (this.metaData.preview) {
                    ArkWindow.util.setImage(this.metaData.preview, this.previewUIObj, function(err) {
                        if (err) {
                            ArkWindow.console.error('set Image error', err);
                        }
                    });
                }
                ArkWindow.console.log('update', this.metaData.buttonText);
                this.buttonUIObj.SetValue(this.metaData.buttonText);
                this.titleUIObj.SetValue(this.metaData.title);
                this.summaryUIObj.SetValue(this.metaData.summary);
            },
            report: function(data) {
                var http = Net.HttpRequest();
                var version = '';
                var os = arkWeb.System.GetOS();
                var uin = '';
                if (arkWeb.QQ && arkWeb.QQ.GetVersion) {
                    version = arkWeb.QQ.GetVersion();
                }
                if (arkWeb.QQ && arkWeb.QQ.GetUIN) {
                    uin = arkWeb.QQ.GetUIN();
                }
                var param = {
                    uin: uin,
                    appid: this.metaData.appid,
                    refer: 1014,
                    via: '1014_1',
                    actiontype: 'ark',
                    sub_actiontype: 'ark_message',
                    reserves_action: data.action,
                    reserves2: data.application,
                    reserves3: data.view,
                    reserves4: data.type,
                    device_platform: os,
                    qqversion: version,
                    t: new Date().getTime()
                };

                var url = 'https://h5.qzone.qq.com/report/compass/' + data.table + '?' + this.toUrlParams(param);
                ArkWindow.console.log('report:', url);
                http.Get(url);
            },
            toUrlParams: function(obj) {
                var arr = [];
                var k;
                for (k in obj) {
                    if (obj.hasOwnProperty(k)) arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
                }
                return arr.join('&');
            }
        }
    };

    var global$6 = ArkWindow;
    ArkWindow.app = {
        viewModels: new Map(),
        config: {},
        GetModel: function(view) {
            var viewRoot = view.GetRoot();
            return ArkWindow.app.viewModels.get(viewRoot);
        },
        OnCreateView: function(view, template) {
            ArkWindow.console.log('OnCreateView:', template);
            if (global$6[template] && global$6[template].ViewModel && global$6[template].ViewModel.New) {
                var viewRoot = view.GetRoot();
                ArkWindow.app.viewModels.set(view, global$6[template].ViewModel.New(viewRoot));
            } else {
                ArkWindow.console.error('no model found for view: ' + template);
            }
        },
        OnDestroyView: function(view, template) {
            var model = ArkWindow.app.GetModel(view);
            model.Deinitialize();
            ArkWindow.app.viewModels.delete(view);
        },
        OnResize: function(sender, srcWidth, srcHeight, dstWidth, dstHeight) {
            arkWeb.System.Tick();
            var model = ArkWindow.app.GetModel(sender);

            model && model.OnResize && model.OnResize(dstWidth, dstHeight);
        },
        OnSetValue: function(sender, value) {
            var model = ArkWindow.app.GetModel(sender);
            model && model.OnSetValue && model.OnSetValue(sender, value);
        },
        OnClick: function(sender, x, y, button, keyState) {
            var model = ArkWindow.app.GetModel(sender);
            model && model.OnClick && model.OnClick(sender, x, y, button, keyState);
        },
        OnStartup: function(config) {
            ArkWindow.console.log('app OnStartup', config);
            ArkWindow.app.config = config;
        },
        OnConfigChange: function(config) {
            ArkWindow.console.log('app OnConfigChange', config);
            ArkWindow.app.config = config;
            ArkWindow.app.viewModels.forEach(function(a, view) {
                var model = ArkWindow.app.GetModel(view);
                model && model.OnConfigChange && model.OnConfigChange(ArkWindow.app.config);
            });
        }
    };

    var global$5 = ArkWindow;

    (function(global) {


        function createAssigner(keysFunc, defaults) {
            return function(obj) {
                var length = arguments.length;
                if (defaults) obj = Object(obj);
                if (length < 2 || obj == null) return obj;
                for (var index = 1; index < length; index++) {
                    var source = arguments[index],
                        keys = keysFunc(source),
                        l = keys.length;
                    for (var i = 0; i < l; i++) {
                        var key = keys[i];
                        if (!defaults || obj[key] === void 0) obj[key] = source[key];
                    }
                }
                return obj;
            };
        }

        function has(obj, path) {
            return obj != null && Object.prototype.hasOwnProperty.call(obj, path);
        }
        function isObject(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        }
        function allKeys(obj) {
            if (!isObject(obj)) return [];
            var keys = [];
            for (var key in obj) keys.push(key);
            return keys;
        }
        function keys(obj) {
            if (!isObject(obj)) return [];
            var keys = [];
            for (var key in obj)
                if (has(obj, key)) keys.push(key);
            return keys;
        }
        var containerInfo;

        global.util = {
            fixurl: function(url, isHttps) {
                if (url == "local" || !url) {
                    return url;
                }
                if (url.indexOf('miniapp://') == 0 || url.indexOf('res:') == 0 || ArkWindow.util.isLocalResUrl(url)) {
                    return url;
                }
                if (url.indexOf('m.q.qq.com') == 0) {
                    return "https://" + url;
                }
                if (url.indexOf('http:') == 0 || url.indexOf('https:') == 0) {
                    return url;
                }
                if (isHttps) {
                    return "https://" + url;
                } else {
                    return "http://" + url;
                }
            },
            isLocalResUrl: function(url) {
                if (!url) {
                    return false;
                }
                url = url || "";
                // res: url是上传/转存前预览的时候用的，是本地图片，直接设置到image元素即可
                if (url.indexOf('image/') == 0 || url.indexOf('res:') == 0) {
                    return true;
                } else {
                    return false;
                }
            },
            createHttpRequest: function() {
                if (Net && Net.HttpRequest) {
                    return Net.HttpRequest();
                }
                return Http.CreateHttpRequest();
            },
            httpDownload: function(url, callback) {
                var httpGet = ArkWindow.util.createHttpRequest();
                var httpStartTime = arkWeb.System.Tick();
                arkWeb.Console.Log('start get resource ' + url + ' at ' + httpStartTime);
                httpGet.SetTimeout(5000);
                httpGet.AttachEvent("OnComplete", function(http) {
                    var httpEndTime = arkWeb.System.Tick();
                    arkWeb.Console.Log('end get resource ' + url + ' at ' + httpEndTime);
                    arkWeb.Console.Log('get resource ' + url + ' cost: ' + (httpEndTime - httpStartTime));
                    if (!http.IsSuccess()) {
                        callback({
                            code: http.GetStatusCode(),
                            msg: 'download url: ' + url + 'fail.'
                        });
                        return;
                    } else {
                        callback(null, http.GetCachePath());
                    }
                });
                httpGet.Get(url);
            },
            _setImage: function(url, viewObject, isHttps, retryTime, callback) {
                var imageUrl = ArkWindow.util.fixurl(url, isHttps);
                viewObject.AttachEvent('OnLoad', function() {
                    viewObject.DetachEvent("OnError");
                    viewObject.DetachEvent("OnLoad");
                    callback();
                });

                var path = arkWeb.Storage.Load(imageUrl);
                if (path) {
                    viewObject.AttachEvent("OnError", function(sender) {
                        viewObject.DetachEvent("OnError");
                        viewObject.DetachEvent("OnLoad");
                        arkWeb.Storage.Save(imageUrl, "");
                        retryTime -= 1;
                        if (retryTime > 0) {
                            ArkWindow.util._setImage(url, viewObject, isHttps, retryTime, callback);
                        } else {
                            callback({
                                code: -1,
                                msg: 'load netwrok image error'
                            });
                        }
                    });
                    viewObject.SetValue(path);
                    return;
                } else {

                    ArkWindow.util.httpDownload(imageUrl, function(err, path) {
                        if (err) {
                            retryTime -= 1;
                            if (retryTime > 0) {
                                ArkWindow.util._setImage(url, viewObject, isHttps, retryTime, callback);
                            } else {
                                callback(err);
                            }
                        } else {
                            arkWeb.Storage.Save(imageUrl, path);
                            viewObject.AttachEvent("OnError", function(sender) {
                                viewObject.DetachEvent("OnError");
                                viewObject.DetachEvent("OnLoad");
                                arkWeb.Storage.Save(imageUrl, "");
                                retryTime -= 1;
                                if (retryTime > 0) {
                                    ArkWindow.util._setImage(url, viewObject, isHttps, retryTime, callback);
                                } else {
                                    callback({
                                        code: -1,
                                        msg: 'load image error'
                                    });
                                }
                            });
                            viewObject.SetValue(path);
                            return;
                        }
                    });

                }
            },
            /*
                设置图片元素的图片链接
            */
            setImage: function(url, viewObject, callback) {

                if (ArkWindow.util.isLocalResUrl(url)) {
                    arkWeb.Console.Log('set local image: ' + url);
                    viewObject.AttachEvent('OnLoad', function() {
                        viewObject.DetachEvent("OnError");
                        viewObject.DetachEvent("OnLoad");
                        callback();
                    });
                    viewObject.AttachEvent("OnError", function(sender) {
                        viewObject.DetachEvent("OnError");
                        viewObject.DetachEvent("OnLoad");
                        callback({
                            code: -1,
                            msg: 'load local image error'
                        });
                    });
                    viewObject.SetValue(url);
                } else {
                    arkWeb.Console.Log('set netwrok image: ' + url);
                    //先用2次http，如果失败再用2次https
                    ArkWindow.util._setImage(url, viewObject, false, 2, function(err) {
                        // if (err) {
                        //     util._setImage(url, viewObject, true, 2, function (err) {
                        //         callback(err);
                        //     })
                        // } else {
                        callback();
                        // }
                    });
                }

            },
            isiOS: function() {
                return arkWeb.System.GetOS() == "iOS";
            },
            isAndroid: function() {
                return arkWeb.System.GetOS() == "Android";
            },
            isWindows: function() {
                return arkWeb.System.GetOS() == "Windows";
            },
            isMac: function() {
                return arkWeb.System.GetOS() == "Mac";
            },
            compareVersion: function(target, cmd) {
                var _compare = function(tokens1, tokens2, p) {
                    if (!tokens1[p] && !tokens2[p]) {
                        return 0;
                    }
                    return ((tokens1[p] || 0) - (tokens2[p] || 0)) || _compare(tokens1, tokens2, p + 1);
                };
                if (arkWeb.QQ && arkWeb.QQ.GetVersion) {

                    var r = _compare(arkWeb.QQ.GetVersion().split('.'), (target + '').split('.'), 0);
                    r = r < 0 ? -1 : r > 0 ? 1 : 0;
                    switch (cmd) {
                        case 'eq':
                            return r === 0;
                        case 'neq':
                            return r !== 0;
                        case 'lt':
                            return r < 0;
                        case 'nlt':
                            return r >= 0;
                        case 'gt':
                            return r > 0;
                        case 'ngt':
                            return r <= 0;
                        default:
                            return r;
                    }
                } else {
                    return false;
                }

            },
            /*
            检测当前QQ版本号是否低于指定版本号，现在支持iOS平台和Android平台
            iOSTargetVersionStr iOS需要判断的版本号，字符串，三位，传入格式如"8.0.0“
            androidTargetVersionStr android需要判断的版本号，字符串，三位，传入格式如”8.0.0“
            */
            isCurrentQQVersionBelowTargetVersion: function(iOSTargetVersionStr, androidTargetVersionStr) {
                if (ArkWindow.util.isiOS()) {
                    return ArkWindow.util.compareVersion(iOSTargetVersionStr, 'lt');
                } else if (ArkWindow.util.isAndroid()) {
                    return ArkWindow.util.compareVersion(androidTargetVersionStr, 'lt');
                } else {
                    return false;
                }
            },
            getAvatar: function(uin, size, platform) {
                if (!uin) {
                    return '';
                }
                size = size || 100;
                platform = platform || 'qq';
                if (platform != 'qq' || platform != 'qzone') {
                    platform = 'qq';
                }
                if (platform == 'qq') {
                    if (size != 40 || size != 100 || size != 140) {
                        size = 100;
                    }
                    return 'q.qlogo.cn/openurl/' + uin + '/' + uin + '/' + size + '?rf=qz_hybrid&c=' + ArkWindow.util.base62().encode('qz_hybrid@' + uin);
                } else if (platform == 'qzone') {
                    if (size != 30 || size != 50 || size != 100) {
                        size = 100;
                    }
                    return 'qlogo' + (uin % 4 + 1) + '.store.qq.com/qzone/' + uin + '/' + uin + '/' + size;
                }

            },
            base62: function() {
                return {
                    decode: function(a) {
                        return ArkWindow.util.base64().decode(a.replace(/ic/g, '/').replace(/ib/g, '+').replace(/ia/g, 'i'));
                    },
                    encode: function(a) {
                        return ArkWindow.util.base64().encode(a).replace(/[=i\+\/]/g, function(m) {
                            switch (m) {
                                case '=':
                                    return '';
                                case 'i':
                                    return 'ia';
                                case '+':
                                    return 'ib';
                                case '/':
                                    return 'ic';
                                default:
                                    return '';
                            }
                        });
                    }
                };
            },

            base64: function() {
                // constants
                var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var b64tab = function(bin) {
                    var t = {};
                    for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
                    return t;
                }(b64chars);
                var fromCharCode = String.fromCharCode;
                // encoder stuff
                var cb_utob = function(c) {
                    if (c.length < 2) {
                        var cc = c.charCodeAt(0);
                        return cc < 0x80 ? c :
                            cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) +
                                fromCharCode(0x80 | (cc & 0x3f))) :
                            (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
                                fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
                                fromCharCode(0x80 | (cc & 0x3f)));
                    } else {
                        var cc = 0x10000 +
                            (c.charCodeAt(0) - 0xD800) * 0x400 +
                            (c.charCodeAt(1) - 0xDC00);
                        return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
                            fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
                            fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
                            fromCharCode(0x80 | (cc & 0x3f)));
                    }
                };
                var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
                var utob = function(u) {
                    return u.replace(re_utob, cb_utob);
                };
                var cb_encode = function(ccc) {
                    var padlen = [0, 2, 1][ccc.length % 3],
                        ord = ccc.charCodeAt(0) << 16 |
                        ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
                        ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
                        chars = [
                            b64chars.charAt(ord >>> 18),
                            b64chars.charAt((ord >>> 12) & 63),
                            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
                        ];
                    return chars.join('');
                };
                var btoa = function(b) {
                    return b.replace(/[\s\S]{1,3}/g, cb_encode);
                };
                var _encode = function(u) {
                    return btoa(utob(u))
                };

                var encode = function(u, urisafe) {
                    return !urisafe ?
                        _encode(u) :
                        _encode(u).replace(/[+\/]/g, function(m0) {
                            return m0 == '+' ? '.' : '*';
                        }).replace(/=/g, '');
                };
                var encodeURI = function(u) {
                    return encode(u, true)
                };
                // decoder stuff
                var re_btou = new RegExp([
                    '[\xC0-\xDF][\x80-\xBF]',
                    '[\xE0-\xEF][\x80-\xBF]{2}',
                    '[\xF0-\xF7][\x80-\xBF]{3}'
                ].join('|'), 'g');
                var cb_btou = function(cccc) {
                    switch (cccc.length) {
                        case 4:
                            var cp = ((0x07 & cccc.charCodeAt(0)) << 18) |
                                ((0x3f & cccc.charCodeAt(1)) << 12) |
                                ((0x3f & cccc.charCodeAt(2)) << 6) |
                                (0x3f & cccc.charCodeAt(3)),
                                offset = cp - 0x10000;
                            return (fromCharCode((offset >>> 10) + 0xD800) +
                                fromCharCode((offset & 0x3FF) + 0xDC00));
                        case 3:
                            return fromCharCode(
                                ((0x0f & cccc.charCodeAt(0)) << 12) |
                                ((0x3f & cccc.charCodeAt(1)) << 6) |
                                (0x3f & cccc.charCodeAt(2))
                            );
                        default:
                            return fromCharCode(
                                ((0x1f & cccc.charCodeAt(0)) << 6) |
                                (0x3f & cccc.charCodeAt(1))
                            );
                    }
                };
                var btou = function(b) {
                    return b.replace(re_btou, cb_btou);
                };
                var cb_decode = function(cccc) {
                    var len = cccc.length,
                        padlen = len % 4,
                        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) |
                        (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) |
                        (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) |
                        (len > 3 ? b64tab[cccc.charAt(3)] : 0),
                        chars = [
                            fromCharCode(n >>> 16),
                            fromCharCode((n >>> 8) & 0xff),
                            fromCharCode(n & 0xff)
                        ];
                    chars.length -= [0, 0, 2, 1][padlen];
                    return chars.join('');
                };
                var atob = function(a) {
                    return a.replace(/[\s\S]{1,4}/g, cb_decode);
                };
                var _decode = function(a) {
                    return btou(atob(a))
                };
                var decode = function(a) {
                    return _decode(
                        a.replace(/[\.\*]/g, function(m0) {
                            return m0 == '.' ? '+' : '/'
                        })
                        .replace(/[^A-Za-z0-9\+\/]/g, '')
                    );
                };

                var Base64 = {
                    atob: atob,
                    btoa: btoa,
                    fromBase64: decode,
                    toBase64: encode,
                    utob: utob,
                    encode: encode, //这个方法是正宗的base64算法
                    encodeURI: encodeURI, //这个是根据我们后台变种的base64算法
                    btou: btou,
                    decode: decode
                };

                return Base64;
            },
            Report: function(id, index, action) {
                if (arkWeb.QQ && arkWeb.QQ.Report) {
                    arkWeb.QQ.Report(id, index, action);
                } else {
                    arkWeb.Console.Log('QQ does not have Report method');
                }
            },
            ReportEx: function(type, data) {
                if (arkWeb.QQ && arkWeb.QQ.ReportEx) {
                    arkWeb.QQ.ReportEx(type, data);
                } else {
                    arkWeb.Console.Log('QQ does not have ReportEx method');
                }
            },
            /*获取小程序url，因为url涉及版本兼容问题，所以收归到一个统一的方法*/
            getMiniAppUrl: function(url, scene, view) {
                // 获取scene值，如果传进来了scene，优先用传进来的，如果没传，判断AIO类型，单聊用1007，群聊用1008
                // url 参数。在群组需要拼接群id _gid，在群组和讨论组需要拼接 _sessionid _sessiontype
                url = url || "";
                ArkWindow.console.log("url:", url);
                var containerInfo = {
                    ChatType: "-1"
                };
                if (arkWeb.QQ.GetContainerInfo) {
                    containerInfo = arkWeb.QQ.GetContainerInfo(view.GetRoot());
                }
                var sceneValue = 1007;
                var typeStr = containerInfo.ChatType;
                var type = parseInt(typeStr, 10);

                if (scene) {
                    // 后台有可能下发了 scene=0，为0的也不能取！
                    sceneValue = scene;
                } else if (type != -1) {
                    if (type <= 2) {
                        sceneValue = 1007;
                    } else if (type > 2) {
                        sceneValue = 1008;
                    }
                }
                var surfix = [];
                if (type != -1) {
                    if (type <= 2) {
                        surfix.push("scene=1007");
                    } else if (type > 2) {
                        surfix.push("scene=1008");
                    }
                    if (type == 3) {
                        surfix.push("&_gid=" + containerInfo.ChatUIN);
                    }

                    if (type == 3 || type == 4) {
                        surfix.push("&_sessionid=" + containerInfo.ChatUIN);
                        surfix.push("&_sessiontype=" + containerInfo.ChatType);
                    }
                }

                if (surfix.length) {
                    if (url.indexOf("?") != -1) {
                        url = url + "&" + surfix.join("&");
                    } else {
                        url = url + "?" + surfix.join("&");
                    }
                }
                ArkWindow.console.log("url:", url);

                // 8.1.0以上版本正式QQ 都用这个schema打开，这个schema仅在ark场景适用
                var jmpUrl = "miniapp://open/" + sceneValue + "?url=" + Net.UrlEncode(url);

                // 安卓800 ios803以下不支持小程序，打开兜底页
                if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("8.0.3", "8.0.0")) {
                    arkWeb.Console.Log('may be regular QQ but version not support miniapp');
                    jmpUrl = "https://m.q.qq.com/update";
                }

                // QQ8.1.0版本开始改用schema打开，8.1.0版本以前用http url打开
                if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("8.1.0", "8.1.0")) {
                    arkWeb.Console.Log("may be regular QQ but version lower then 810, use http url");
                    jmpUrl = url;
                }

                // QQ极速版版本号从4.0.0开始，由于ark没有方法判断是否极速版，所以暂时把5.0.0以下的当作极速版
                if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("5.0.0", "5.0.0")) {
                    arkWeb.Console.Log("may be quick QQ, can open miniapp");
                    jmpUrl = url;
                }

                // 不是小程序的地址的话，也不拼前缀了，直接打开
                if (url.startsWith("https://m.q.qq.com/a/") || url.startsWith("http://m.q.qq.com/a/") || url.startsWith("mqqapi://microapp/open") || url.startsWith("mqqapi://miniapp/open") || url.startsWith("mqqapi://miniapp/adopen")) {
                    arkWeb.Console.Log("is miniapp url");
                } else {
                    arkWeb.Console.Log("not miniapp url");
                    jmpUrl = url;
                }

                arkWeb.Console.Log("opening miniapp, url: " + jmpUrl);

                return jmpUrl;
            },
            isExistBoldTitle: function(key, array) {
                var titleLen = 0;
                for (var i = 0, len = array.length; i < len; i++) {
                    if (array[i].title === key) {
                        titleLen++;
                    }
                }
                return titleLen;
            },
            toUrlParams: function(obj) {
                var arr = [];
                var k;
                for (k in obj) {
                    if (obj.hasOwnProperty(k))
                        arr.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
                }
                return arr.join("&");
            },
            extend: createAssigner(allKeys),
            extendOwn: createAssigner(keys),
            getContainerInfo: function(view) {
                if (containerInfo) {
                    return containerInfo;
                }
                if (arkWeb.QQ.GetContainerInfo) {
                    containerInfo = arkWeb.QQ.GetContainerInfo(view.GetRoot());
                    var chatType = parseInt(containerInfo.ChatType || "", 10) || 0;
                    var chatUIN = parseInt(containerInfo.ChatUIN || "", 10) || 0;
                    var group;
                    if (chatType == 3 || chatType == 4) {
                        group = true;
                    } else {
                        group = false;
                    }
                    containerInfo = {
                        chatType: chatType,
                        chatUIN: chatUIN,
                        group: group
                    };
                } else {
                    containerInfo = {};
                }
                return containerInfo;
            },
            getChatTypeName(chatType) {
                var chatTypeMap = [{
                        name: 'group',
                        chatTypes: [3, 4]
                    },
                    {
                        name: 'c2c',
                        chatTypes: [1, 2, 5, 6, -1]
                    },
                    {
                        name: 'channel',
                        chatTypes: [7]
                    }
                ];

                var chatTypeItem = chatTypeMap.find(item => item.chatType === chatType);
                return chatTypeItem && chatTypeItem.name || 'c2c';
            },
            getFootTitleByAppType: function(appType) {
                ArkWindow.console.log("getFootTitleByAppType:", appType);
                return ['QQ小程序', '进入小游戏中心 >'][Number(appType)];
            },
            getFootIconByAppType: function(appType) {
                ArkWindow.console.log("getFootIconByAppType:", appType);
                return ['image/icon-miniprogram@2x.png', 'image/icon-minigame@2x.png'][Number(appType)];
            }
        };

    })(global$5);

    ArkWindow.report = {
        // 上报罗盘
        compass: function(data, table) {
            data = data || {};
            if (!table) {
                return;
            }
            var http = Net.HttpRequest();
            var version = "";
            var os = arkWeb.System.GetOS();
            var uin = "";
            if (typeof arkWeb.QQ != "undefined" && arkWeb.QQ.GetVersion) {
                version = arkWeb.QQ.GetVersion();
            }
            if (typeof arkWeb.QQ != "undefined" && arkWeb.QQ.GetUIN) {
                uin = arkWeb.QQ.GetUIN();
            }
            var touin = data.uin || "";
            delete data.uin;
            var param = ArkWindow.util.extendOwn({
                uin: uin,
                touin: touin,
                appid: "",
                refer: "",
                actiontype: "",
                sub_actiontype: "",
                reserves_action: "",
                reserves2: "",
                reserves3: "",
                reserves4: "",
                device_platform: os,
                qqversion: version,
                timestamp: Date.now()
            }, data);
            ArkWindow.console.log("reportn compass param:", param);
            var url = "https://h5.qzone.qq.com/report/compass/" + table + "?" + ArkWindow.util.toUrlParams(param);
            ArkWindow.console.log("reportn compass url:", url);
            http.Get(url);
        }

    };

    ArkWindow.theme = {

        // 手Q主题ID
        ThemeID: {
            ConciseWhite: "2971", // 主题ID：2971——简洁模式白色
            ConciseGray: "2921", // 主题ID：2921——简洁模式灰色
            ConciseBlack: "2920", // 主题ID: 2920——简洁模式黑色

            DefaultDefault: "2100", // 主题ID: 2100——默认模式默认颜色
            AndroidDefaultBlack: "1103", // 主题ID: 1103——默认模式黑色
            iOSDefaultBlack: "1102", // 主题ID: 1103——默认模式黑色

            ConciseGreen: "3063", // 主题ID：3063——简洁模式-绿色
            ConciseYellow: "3064", // 主题ID：3064——简洁模式-黄色
            ConcisePurple: "3065", // 主题ID：3065——简洁模式-紫色
            ConcisePink: "3066", // 主题ID：3066——简洁模式-粉色
            ConciseRed: "3067", // 主题ID：3067——简洁模式-红色

            TIMDefault: "1015712", //  TIM 默认主题
        },

        // 当前是否是频道AIO
        isCurrentInGuildAIO: function(view) {

            // 测试频道代码
            // return true

            var containerInfo = arkWeb.QQ.GetContainerInfo(view.GetRoot());
            if (!containerInfo) {
                ArkWindow.console.log('get container info return null');
                return false;
            }
            ArkWindow.console.log('current chat type is:', containerInfo.ChatType);

            // 手Q定义的频道类型
            var AIO_TYPE_GUILD = "7";
            return AIO_TYPE_GUILD == containerInfo.ChatType;
        },

        // 当前是否是夜间模式
        isDarkMode: function() {
            if (ArkWindow.app.config && ArkWindow.app.config.theme) {
                var themeId = ArkWindow.app.config.theme.themeId;
                return themeId == this.ThemeID.ConciseBlack ||
                    themeId == this.ThemeID.AndroidDefaultBlack ||
                    themeId == this.ThemeID.iOSDefaultBlack
            }
            return false;
        },

        // 当前是否是简洁模式
        isConciseMode: function() {
            if (ArkWindow.app.config && ArkWindow.app.config.theme) {
                return ArkWindow.app.config.theme.mode == "concise";
            }
            return false;
        }

    };

    ArkWindow.notification = {
        ViewModel: {
            New: function(view) {
                var model = Object.create(this);
                model.Initialize(view);
                return model;
            },
            Initialize: function(view) {
                ArkWindow.console.log('notification Initialize');
                this.view = view;
                //兜底数据
                this.metaData = {
                    "appInfo": {
                        "appid": 0,
                        "appType": 4,
                        "appName": "",
                        "iconUrl": ""
                    },
                    "title": "订单取消通知",
                    "emphasis_keyword": "加粗字段标题",
                    "data": [{
                            "title": "加粗字段标题",
                            "value": "加粗字段内容"
                        },
                        {

                            "title": "字段标题",
                            "value": "字段内容"
                        },
                        {
                            "title": "字段标题",
                            "value": "字段内容"
                        }
                    ],
                    "button": [{
                            "name": "进入小程序查看详情",
                            "action": ""
                        },
                        {
                            "name": "拒绝通知",
                            "action": ""
                        }
                    ]
                };
                this.appEventView = view.GetUIObject("appEvent");
                this.appLogoView = view.GetUIObject("appLogo");
                this.appNameView = view.GetUIObject("appName");
                this.appMsgContent = view.GetUIObject('appMsgContent');
                this.appMsgTypeView = view.GetUIObject("appMsgType");
                this.appMsgDetailView = view.GetUIObject("appMsgDetail");
                this.appMsgTxtView = view.GetUIObject("appMsgTxt");
                this.notificationView = this.view.GetRoot();

                var self = this;
                view.GetUIObject("appMsgContentWrap").AttachEvent("OnClick", function() {
                    // 整个内容区域
                    ArkWindow.console.log('notification appMsgContentWrap OnClick');
                    //上报到ark表  
                    ArkWindow.util.Report(self.view.GetRoot().GetID(), 3, "Button.OnClick");
                    var url = self.metaData["button"][0]["action"];
                    url = ArkWindow.util.fixurl(url);
                    self.jumpToUrl(url);
                    self.reportClick();
                });
                view.GetUIObject("appMsgAction1").AttachEvent("OnClick", function() {
                    // 查看详情
                    ArkWindow.console.log('notification appMsgAction1 OnClick');
                    //上报到ark表
                    ArkWindow.util.Report(self.view.GetRoot().GetID(), 3, "Button.OnClick");
                    var url = self.metaData["button"][0]["action"];
                    url = ArkWindow.util.fixurl(url);
                    self.jumpToUrl(url);
                    self.reportClick();
                });
                var viewSize = this.view.GetSize();
                this.OnResize(viewSize.width, viewSize.height);
                this.changeBg(ArkWindow.app.config);
            },
            Deinitialize: function() {
                ArkWindow.console.log('notification Deinitialize');
            },
            OnResize: function(width, height) {
                // console.log('notification OnResize');
                // this.Update();
            },
            OnSetValue: function(sender, value) {
                ArkWindow.console.log('OnSetValue', value);
                var self = this;
                this.metaData = value.notification || this.metaData;
                this.height = this.metaData.data.length * 6 + 40;
                var len = ArkWindow.util.isExistBoldTitle(this.metaData.emphasis_keyword, this.metaData.data);
                if (len !== 0) {
                    // 加上加粗和减少原来本在小标题的高度
                    this.height = (this.height - 6 * len) + 15;
                }
                // 如果没有配置拒收通知的action就不要显示拒收通知了 
                if ((!self.metaData["button"][1]) || (!self.metaData["button"][1]["action"])) {
                    this.view.GetUIObject("appMsgAction2").SetStyle("display:none;");
                } else if (self.metaData["button"][1]["action"]) {
                    this.view.GetUIObject("appMsgAction2").AttachEvent("OnClick", function() {
                        // 拒收通知
                        ArkWindow.console.log('notification appMsgAction2 OnClick');
                        //上报到ark表
                        ArkWindow.util.Report(self.view.GetRoot().GetID(), 3, "Button.OnClick");
                        var url = self.metaData["button"][1]["action"];
                        arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                        self.reportClick();
                    });
                }
                // this.notificationView.SetStyle(`display:flex;flexDirection:column;width:90vw;height:${this.height}vw;`)
                this.Update();
                // 曝光上报
                var compassData = {
                    uin: self.metaData.host && self.metaData.host.uin || "",
                    appid: self.metaData.appInfo && self.metaData.appInfo.appid || 0,
                    refer: self.metaData.scene || 0,
                    actiontype: "ark",
                    sub_actiontype: "ark_message",
                    reserves_action: "expo",
                    reserves2: "com.tencent.miniapp_01",
                    reserves3: "notification",
                    reserves4: "",
                };
                ArkWindow.report.compass(compassData, "dc04239");
            },
            OnConfigChange: function(config) {
                ArkWindow.console.log('notification OnConfigChange', config);
                this.changeBg(config);
            },
            changeBg(config) {
                var themeObj = {
                    ConciseWhite: 2971, //--主题ID：2971——简洁模式白色
                    ConciseGray: 2921, //--主题ID：2921——简洁模式灰色
                    ConciseBlack: 2920 //--主题ID: 2920——简洁模式黑色    
                };
                if (config && config.theme) {
                    var texture = this.view.GetTexture('bgColor');
                    var theme = config.theme;
                    if (texture) {
                        var themeId = theme.themeId + "";
                        theme.mode;

                        if (themeId == themeObj.ConciseWhite) {
                            ArkWindow.console.log('setBackground ConciseWhite');
                            texture.SetValue(0xFFF5F6FA);
                        } else if (themeId == themeObj.ConciseGray) {
                            ArkWindow.console.log('setBackground ConciseGray');
                            texture.SetValue(0xFFFFFFFF);
                        } else if (themeId == themeObj.ConciseBlack) {
                            ArkWindow.console.log('setBackground ConciseBlack');
                            texture.SetValue(0xFFFFFFFF);
                        } else {
                            ArkWindow.console.log('setBackground nothing');
                        }
                    }
                }
            },
            jumpToUrl: function(url) {
                var jumpUrl;
                var scene = '1014'; // 1014 模版消息 2085订阅消息

                // 模版消息&订阅消息不用util.getMiniAppUrl的原因：要上报一个特殊scene值，而安卓和iOS的要上报这个值的url还不同，不能用util.getMiniAppUrl里面的统一scheme
                if (ArkWindow.util.isCurrentQQVersionBelowTargetVersion("8.2.6", "8.2.6")) {
                    if (ArkWindow.util.isiOS()) {
                        ArkWindow.console.log('ios');
                        jumpUrl = 'mqqapi://microapp/open?url=' + encodeURIComponent(url);
                    } else {
                        jumpUrl = url;
                    }
                    ArkWindow.console.log('jumpUrl:' + jumpUrl);
                    arkWeb.QQ.OpenUrl(jumpUrl, this.view.GetRoot());
                } else {
                    // 以上是 820版本及820以前的情况
                    // 826开始，安卓和iOS又统一成一样了。hehe~ 
                    var temp = url.match(/scene=(\d+)/);
                    if (temp && temp[1]) {
                        scene = temp[1];
                    }
                    jumpUrl = ArkWindow.util.getMiniAppUrl(url, scene, this.view);
                    ArkWindow.console.log('jumpUrl:' + jumpUrl);
                    arkWeb.QQ.OpenUrl(jumpUrl, this.view.GetRoot());
                }
            },
            reportClick: function() {
                var self = this;
                // 曝光上报
                var compassData = {
                    uin: self.metaData.host && self.metaData.host.uin || "",
                    appid: self.metaData.appInfo && self.metaData.appInfo.appid || 0,
                    refer: self.metaData.scene || 0,
                    actiontype: "ark",
                    sub_actiontype: "ark_message",
                    reserves_action: "click",
                    reserves2: "com.tencent.miniapp_01",
                    reserves3: "notification",
                    reserves4: "",
                };
                ArkWindow.report.compass(compassData, "dc04239");
            },
            /*resize和setvalue同意调用update，更新视图*/
            Update: function() {
                ArkWindow.console.log('Update');
                if (!this.metaData || !this.metaData.appInfo) {
                    return;
                }
                if (this.metaData.appInfo.iconUrl) {
                    ArkWindow.util.setImage(this.metaData.appInfo.iconUrl, this.appLogoView, function(err) {
                        if (err) {
                            ArkWindow.console.error('set Image error', err);
                        }
                    });
                }

                this.appEventView.SetValue(this.metaData.title);
                this.appNameView.SetValue(this.metaData.appInfo.appName);
                this.appMsgDetailView.ClearChildren();
                if (ArkWindow.util.isExistBoldTitle(this.metaData.emphasis_keyword, this.metaData.data) === 0) {
                    this.appMsgContent.SetStyle('display:none');
                }

                // 缓存 titleTempText 相关信息
                var titleUIObj = [];
                var titleObj = [];
                for (var i = 0, len = this.metaData.data.length; i < len; i++) {
                    /*   
                      动态插入元素，可能会导致SetMultiline失效，    
                      需要把    
                      titleTempText.SetValue(this.metaData.data[i].title);   
                      contentTempText.SetValue(this.metaData.data[i].value);     
                      放到最下面。     
                      TODO 具体原因需要找ruifanyuan确认清楚     
                    */
                    if (this.metaData.data[i].title === this.metaData.emphasis_keyword) {
                        this.appMsgTypeView.SetValue(this.metaData.data[i].title);
                        this.appMsgTxtView.SetValue(this.metaData.data[i].value);
                        if (this.metaData.data[i].value.length > 24) {
                            this.appMsgTxtView.SetValue(this.metaData.data[i].value.slice(0, 24));
                        }
                        continue;
                    }
                    var tempView = UI.View();
                    tempView.SetStyle("display:flex;flexDirection:row;alignItems:flex-start;marginTop:4;");
                    var titleTempText = UI.Text();
                    titleTempText.SetStyle("display:block;width:auto;");
                    titleTempText.SetTextColor(0xFF878B99);
                    titleTempText.SetFont("size.14");
                    titleTempText.SetAutoSize(true);
                    // titleTempText.SetMultiline(true);   
                    var contentTempText = UI.Text();
                    contentTempText.SetStyle("display:block;flex:1;marginLeft:12;");
                    contentTempText.SetTextColor(0xFF03081A);
                    contentTempText.SetFont("size.14");
                    contentTempText.SetAutoSize(true);
                    contentTempText.SetMultiline(true);
                    tempView.AddChild(titleTempText);
                    tempView.AddChild(contentTempText);
                    this.appMsgDetailView.InsertChild(i, tempView);
                    // 这两个元素设置value需要放到最下面这里来  
                    titleTempText.SetValue(this.metaData.data[i].title);
                    contentTempText.SetValue(this.metaData.data[i].value);

                    // 存入每个 titleTempText 的宽度和高度
                    titleUIObj.push(titleTempText.GetSize());
                    titleObj.push(titleTempText);
                }

                // 找出最长的 titleTempText 宽度
                var titleMaxWidth = 0;
                for (var j = 0, len = titleUIObj.length; j < len; j++) {
                    if (titleUIObj[j].width > titleMaxWidth) {
                        titleMaxWidth = titleUIObj[j].width;
                    }
                }
                // 重设 titleTempText 的 setStyle
                for (var k = 0, len = titleObj.length; k < len; k++) {
                    titleObj[k].SetStyle("display:block;width:" + titleMaxWidth);
                }

            }
        }
    };

    var global$4 = ArkWindow;
    (function() {
        // 搞成闭包，避免污染全局变量
        var appView = "view_8C8E89B49BE609866298ADDFF2DBABA4";
        global$4[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    this.view = view;
                    // 兜底数据
                    this.metaData = {
                        "appid": "",
                        "icon": "image/icon.png",
                        "title": "QQ小程序",
                        "desc": "推荐你使用这个小程序",
                        "url": "m.q.qq.com/a/s/aa3fbe89d8fa622322840bb53e7d9400",
                        "preview": "image/preview.png",
                        "appType": 0, // 0 小程序， 1 小游戏
                        "scene": 0,
                        "host": {
                            "uin": 0,
                            "nick": ""
                        },
                        "shareTemplateId": "",
                        "shareTemplateData": {
                            "bottomBtnTxt": "",
                            "bottomBtnShow": "off"
                        },
                        "showLittleTail": "1", // 新增   ---是否展示ark卡片小尾巴 0不展示 1展示
                        "gamePoints": "222", // 新增   ---积分
                        "gamePointsUrl": "https://q.qq.com", // 新增   ---跳转积分中心链接
                    };

                    this.iconUIObj = view.GetUIObject("icon");
                    this.titleUIObj = view.GetUIObject("title");
                    this.descUIObj = view.GetUIObject("desc");
                    this.titleForFooterUIObj = view.GetUIObject("titleForFooter");
                    this.footIconUIObj = view.GetUIObject("footIcon");

                    this.previewUIObj = view.GetUIObject("preview");
                    this.buttonWrapUIObj = view.GetUIObject("buttonWrap");
                    this.buttonTextUIObj = view.GetUIObject("buttonText");
                    this.originWrapUIObj = view.GetUIObject("originWrap");
                    this.originTexture = this.originWrapUIObj.GetTexture("originTexture");
                    this.titleViewUIObj = view.GetUIObject("titleView");
                    this.titleTexture = this.titleViewUIObj.GetTexture("titleTexture");
                    this.previewViewUIObj = view.GetUIObject("previewView");
                    this.previewTexture = this.previewViewUIObj.GetTexture("previewTexture");
                    this.buttonTexture = this.buttonWrapUIObj.GetTexture("buttonTexture");
                    this.littleTail = view.GetUIObject("littleTail");
                    this.gamePointsText = view.GetUIObject("gamePointsText");
                    this.miniappIconUIObj = view.GetUIObject("miniappIcon");
                    this.wxMiniappIconUIObj = view.GetUIObject("wxMiniappIcon");
                    this.footerTitleUIObj = view.GetUIObject("footerTitle");
                    this.previewPicUIObj = view.GetUIObject("previewPic");

                    this.blueBar = view.GetUIObject("blueBar");
                    this.blueBarTexture = this.blueBar.GetTexture("blueBarTexture");

                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();

                    // 绑定点击事件
                    var self = this;
                    this.titleViewUIObj.AttachEvent("OnClick", function() {
                        self.jumpMiniApp();
                    });
                    this.previewViewUIObj.AttachEvent("OnClick", function() {
                        self.jumpMiniApp();
                    });
                    this.originWrapUIObj.AttachEvent("OnClick", function() {
                        self.clickOriginWrapUI();
                    });
                },
                Deinitialize: function() {
                    ArkWindow.console.log("Deinitialize " + appView);
                },
                OnConfigChange(config) {
                    // 夜间模式适配
                    var isDarkMode = ArkWindow.theme.isDarkMode();
                    if (isDarkMode) {
                        this.darkModeAdapt(this.metaData);
                    } else {
                        this.lightModeAdapt(this.metaData);
                    }

                },
                OnResize: function() {
                    ArkWindow.console.log("OnResize " + appView);
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    ArkWindow.console.log("share game OnSetValue:", value);
                    this.metaData = value;

                    // 判断是否是频道
                    var info = ArkWindow.util.getContainerInfo(this.view);
                    var chatType = info.chatType;
                    var type = parseInt(chatType, 10);
                    // var type = 7;  // 频道测试代码
                    // 7表示频道
                    if (type === 7) {
                        this.isGuild = true;
                    } else {
                        this.isGuild = false;
                        this.footerTitleUIObj.SetStyle("display:flex;flex:1;paddingLeft:5;paddingTop:3;");
                        this.blueBar.SetVisible(false);
                    }

                    // 如果是频道，则进行样式适配
                    if (this.isGuild) {
                        this.guildStyleAdapt();
                    }
                    // if (util.isiOS()) {
                    this.previewPicUIObj.SetStyle("display:block;width:100%;height:195;");
                    // }

                    // 夜间模式适配
                    this.darkModeAdapt(value);
                    // 简洁模式适配
                    this.conciseModeAdapt();

                    // if (app.config && app.config.theme) {
                    //  var theme =  app.config.theme;
                    //  if (theme && theme.mode === "concise") {
                    //    // 极简白
                    //    if (theme.themeId === '2971') {
                    //      this.originTexture.SetValue(0xFFEBEDF5);
                    //      this.titleTexture.SetValue(0xFFF5F6FA);
                    //      this.previewTexture.SetValue(0xFFF5F6FA);
                    //      this.buttonTexture.SetValue(0xFFF5F6FA);
                    //    } else if (theme.themeId === '2921' || theme.themeId === '1015712') {
                    //    // 素雅灰
                    //    // 1015715 代表TIM
                    //      this.originTexture.SetValue(0xFFEBEDF5);
                    //    }
                    //  }
                    // }
                    var self = this;
                    this.metaData = value.detail_1 || this.metaData;
                    ArkWindow.console.log("share game metaData:");
                    ArkWindow.console.log(this.metaData);
                    this.Update();
                    // 曝光上报
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "expo",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: this.metaData.type == 1 ? "friendPay" : "",
                        reserves5: ArkWindow.util.getContainerInfo(self.view).group ? "group" : "c2c"
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                    // 更新 desc 后，需要修复 desc 的高度，最多两行，超出截断
                    var descHeight = this.descUIObj.GetSize().height;
                    ArkWindow.console.log("descHeight:", descHeight);
                    if (ArkWindow.util.isiOS()) {
                        ArkWindow.console.log("isiOS");
                        if (descHeight > 24) {
                            this.descUIObj.SetStyle("display:block;height:52;margin:2 10 0 4;");
                        } else {
                            this.descUIObj.SetStyle("display:block;height:26;margin:2 10 0 4;");
                        }
                    } else if (ArkWindow.util.isAndroid()) {
                        ArkWindow.console.log("isAndroid");
                        if (descHeight > 23.3) {
                            this.descUIObj.SetStyle("display:block;height:50;margin:5 10 0 4;");
                        } else {
                            this.descUIObj.SetStyle("display:block;height:25;margin:5 10 0 4;");
                        }
                    } else {
                        // pc
                        ArkWindow.console.log("isiOS");
                        if (descHeight > 24) {
                            this.descUIObj.SetStyle("display:block;height:52;margin:2 10 0 4;");
                        } else {
                            this.descUIObj.SetStyle("display:block;height:22;margin:4 10 0 4;");
                        }
                    }

                },
                Update: function() {
                    ArkWindow.console.log("Update", this.metaData.icon);
                    if (this.metaData.icon) {
                        ArkWindow.util.setImage(this.metaData.icon, this.iconUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }
                    // 开发者配置展示按钮和按钮文案
                    if (this.metaData.shareTemplateId && this.metaData.shareTemplateData && this.metaData.shareTemplateData.bottomBtnShow && this.metaData.shareTemplateData.bottomBtnShow == "on") {
                        ArkWindow.console.log("bottomBtn txt: ", this.metaData.shareTemplateData.bottomBtnTxt);
                        this.buttonTextUIObj.SetValue(this.metaData.shareTemplateData.bottomBtnTxt || "");
                        this.buttonWrapUIObj.SetStyle("display:flex;flexDirection:row;alignItems:center;justifyContent:center;");
                        ArkWindow.console.log("display bottom btn");
                    } else {
                        ArkWindow.console.log("hide bottom btn");
                        this.buttonWrapUIObj.SetStyle("display:none;");
                    }


                    this.titleUIObj.SetValue(this.metaData.title);
                    this.descUIObj.SetValue(this.metaData.desc);
                    this.titleForFooterUIObj.SetValue(ArkWindow.util.getFootTitleByAppType(this.metaData.appType));
                    this.footIconUIObj.SetValue(ArkWindow.util.getFootIconByAppType(this.metaData.appType));

                    // 微信小程序的特殊处理
                    this.wxAppHandle();

                    ArkWindow.console.log("Update", this.metaData.preview);
                    if (this.metaData.preview) {
                        ArkWindow.util.setImage(this.metaData.preview, this.previewUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }

                    // ark小尾巴
                    var self = this;
                    if (!parseInt(this.metaData.showLittleTail, 10)) {
                        this.littleTail.SetVisible(false);
                    } else {
                        this.littleTail.SetVisible(true);
                        // 积分
                        var gamePoints = parseInt(this.metaData.gamePoints, 10) || 0;
                        // 积分跳转链接
                        var gamePointsUrl = this.metaData.gamePointsUrl || "";
                        if (gamePoints) {
                            this.gamePointsText.SetValue("你有一个" + gamePoints + "积分礼包待领取");
                        } else {
                            this.gamePointsText.SetValue("惊喜积分好礼等你来领");
                        }
                        this.littleTail.AttachEvent("OnClick", function() {
                            gamePointsUrl = ArkWindow.util.fixurl(gamePointsUrl);
                            ArkWindow.console.log("gamePointsUrl:", gamePointsUrl);
                            arkWeb.QQ.OpenUrl(gamePointsUrl, self.view.GetRoot());
                        });
                    }
                },
                jumpMiniApp: function() {
                    var self = this;
                    ArkWindow.console.log(appView + ' OnClick');
                    //上报到ark表
                    ArkWindow.util.Report(this.view.GetRoot().GetID(), 3, "Button.OnClick");

                    // 微信小程序低版本兼容
                    var businessType = this.metaData && this.metaData.businessType || 0;
                    var upgradeUrl = 'https://im.qq.com/mobileqq';
                    var isWxApp = parseInt(businessType, 10) == 2;
                    // 如果是微信小程并且版本低于8.8.80
                    if (isWxApp && ArkWindow.util.isCurrentQQVersionBelowTargetVersion("8.8.80", "8.8.80")) {
                        arkWeb.QQ.OpenUrl(upgradeUrl, this.view.GetRoot());
                        return;
                    }

                    var url = this.metaData["url"];
                    url = ArkWindow.util.fixurl(url);
                    url = ArkWindow.util.getMiniAppUrl(url, self.metaData["scene"], self.view);
                    ArkWindow.console.log("OpenUrl url:", url);
                    ArkWindow.console.log("befor OpenUrl");
                    arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                    ArkWindow.console.log("after OpenUrl");
                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: this.metaData.type == 1 ? "friendPay" : "",
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                clickOriginWrapUI: function() {
                    ArkWindow.console.log("clickOriginWrapUI");
                    ArkWindow.console.log(this.metaData.appType);
                    if (Number(this.metaData.appType) !== 1 || !this.metaData.appType) {
                        // 非小游戏走原有的跳转逻辑
                        this.jumpMiniApp();
                        return;
                    }
                    var url = "mqqapi://hippy/open?bundleName=miniGameCenter";
                    arkWeb.QQ.OpenUrl(url, this.view.GetRoot());
                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click_minigamestore",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        touin: containerInfo.chatUIN,
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                // 修改背景颜色
                setBackgroundColor: function(color) {
                    this.originTexture.SetValue(color);
                    this.titleTexture.SetValue(color);
                    this.previewTexture.SetValue(color);
                    this.buttonTexture.SetValue(color);
                },
                // 频道ark样式适配
                guildStyleAdapt: function() {
                    ArkWindow.console.log('guildStyleAdapt');
                    // 1. 修改背景颜色
                    this.setBackgroundColor(0xFFEEEEF2);
                    // 2. 加蓝条
                    this.blueBarTexture.SetValue(0xFF0099FF);
                    // 3. 隐藏icon图标
                    this.miniappIconUIObj.SetVisible(false);
                    this.previewViewUIObj.SetStyle("display:block;width:auto;padding:0 10 0 10;");
                    if (ArkWindow.util.isAndroid()) {
                        this.previewPicUIObj.SetStyle("display:block;width:100%;height:205;");
                    }
                },
                // 夜间模式适配
                darkModeAdapt: function(value) {
                    var isDarkMode = ArkWindow.theme.isDarkMode() || false;
                    ArkWindow.console.log('darkModeAdapt', isDarkMode);
                    ArkWindow.console.log('current mode is dark?:', isDarkMode);
                    if (isDarkMode && !this.isGuild) {
                        this.setBackgroundColor(0xFF262626);
                        this.titleUIObj.SetTextColor(0xFF666666);
                        this.descUIObj.SetTextColor(0xFFFFFFFF);
                        this.titleForFooterUIObj.SetTextColor(0xFF666666);
                        this.originTexture.SetValue(0xFF262626);
                    }
                },
                // 白天模式适配
                lightModeAdapt: function(value) {
                    var isDarkMode = ArkWindow.theme.isDarkMode();
                    ArkWindow.console.log('lightModeAdapt', isDarkMode);
                    ArkWindow.console.log('current mode is dark?:', isDarkMode);
                    if (!isDarkMode && !this.isGuild) {
                        this.setBackgroundColor(0xFFFFFFFF);
                        this.titleUIObj.SetTextColor(0xffB2B2B2);
                        this.descUIObj.SetTextColor(0xFF222222);
                        this.titleForFooterUIObj.SetTextColor(0xFFB2B2B2);
                        this.originTexture.SetValue(0xFFFFFFFF);
                    }
                },
                // 简洁模式适配
                conciseModeAdapt: function() {
                    var isConciseMode = ArkWindow.theme.isConciseMode() || false;
                    var isDarkMode = ArkWindow.theme.isDarkMode() || false;
                    ArkWindow.console.log('current mode is concise?:', isConciseMode);
                    if (isConciseMode && !this.isGuild && !isDarkMode) {
                        this.setBackgroundColor(0xFFFFFFFF);
                        this.originTexture.SetValue(0xFFFFFFFF);
                        // 隐藏icon图标
                        this.miniappIconUIObj.SetVisible(false);
                        this.footerTitleUIObj.SetStyle("display:flex;flex:1;paddingLeft:12;paddingTop:1;");
                    }
                },

                // 微信小程序的一些特殊处理
                wxAppHandle: function() {
                    // 0小程序 1小游戏 2微信小程序
                    var businessType = this.metaData && this.metaData.businessType || 0;
                    var appType = this.metaData && this.metaData.appType || 0;
                    var isWxApp = parseInt(businessType, 10) == 2;
                    var isMiniGame = parseInt(businessType, 10) == 1 || appType == 1;
                    if (isWxApp) {
                        this.wxMiniappIconUIObj.SetVisible(true);
                        this.miniappIconUIObj.SetVisible(false);
                        this.titleForFooterUIObj.SetValue('微信小程序');
                    } else if (isMiniGame) {
                        // QQ小游戏
                        this.wxMiniappIconUIObj.SetVisible(false);
                        this.miniappIconUIObj.SetVisible(true);
                        this.titleForFooterUIObj.SetValue('进入小游戏中心>');
                    } else {
                        this.wxMiniappIconUIObj.SetVisible(false);
                        this.miniappIconUIObj.SetVisible(true);
                        this.titleForFooterUIObj.SetValue('QQ小程序');
                    }
                }
            }
        };
    })();

    var global$3 = ArkWindow;
    (function() {
        // 搞成闭包，避免污染全局变量
        var appView = "view_95A06A1683C80BECC99BE5CC7B6D706B";
        global$3[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log("initialize " + appView);
                    this.view = view;
                    this.setvalue = false;

                    // demo数据
                    this.metaData = {
                        "appid": "1109595906", //小游戏appid
                        "icon": "https://miniapp.gtimg.cn/public/appicon/c755fac4b7473c4bb58726e30da3b60a_200.jpg", //小游戏的icon
                        "name": "垃圾分类管家", //小游戏名称
                        "title": "妈妈再也不用担心我倒错垃圾了~!", //小游戏转发标题
                        "imageUrl": "https://sola.gtimg.cn/aoi/sola/20200611201432_TVQLFtRsTk.png", //背景图片url
                        "path": "https://m.q.qq.com/a/s/a5a2744860397489cfcabe29667d9c9e",
                        "appType": 0, // 0 小程序， 1 小游戏                               //转发路径
                        "scene": 1036, //场景值，用于上报
                        "host": {
                            "uin": 0, //模版发送人的uin，用于上报
                            "nick": ""
                        },
                        "shareTemplateId": "xxxxxxxxxxxxxx", //模版id
                        "shareTemplateData": { //模版id对应的内容
                            "bottomBtnTxt": "打开" // 底部按钮文案
                        }
                    };

                    this.iconUIObj = view.GetUIObject("icon");
                    this.nameUIObj = view.GetUIObject("name");
                    this.titleUIObj = view.GetUIObject("title");
                    this.imageUrlUIObj = view.GetUIObject("imageUrl");
                    this.bottomBtnTxtUIObj = view.GetUIObject("bottomBtnTxt");
                    this.buttonWrapUIObj = view.GetUIObject("buttonWrap");

                    this.titleWrapUIObj = view.GetUIObject("titleWrap");
                    this.titleWrapTexture = this.titleWrapUIObj.GetTexture("titleWrapTexture");
                    this.previewWrapUIObj = view.GetUIObject("previewWrap");
                    this.previewWrapTexture = this.previewWrapUIObj.GetTexture("previewWrapTexture");
                    this.buttonContainUIObj = view.GetUIObject("buttonContain");
                    this.buttonContainTexture = this.buttonContainUIObj.GetTexture("buttonContainTexture");
                    this.footerUIObj = view.GetUIObject("footer");
                    this.footerTexture = this.footerUIObj.GetTexture("footerTexture");
                    this.footerTitleUIObj = view.GetUIObject("footerTitle");
                    this.footIconUIObj = view.GetUIObject("footIcon");

                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();

                    // 绑定点击事件
                    var self = this;
                    this.titleWrapUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.previewWrapUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.buttonContainUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.footerUIObj.AttachEvent("OnClick", function() {
                        self.clickOriginWrapUI();
                    });
                },
                Deinitialize: function() {
                    ArkWindow.console.log("Deinitialize " + appView);
                },
                OnResize: function() {
                    ArkWindow.console.log("OnResize " + appView);
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    if (this.setvalue) {
                        return;
                    }
                    this.setvalue = true;
                    ArkWindow.console.log("OnSetValue", value, ArkWindow.app.config);
                    var self = this;
                    this.metaData = value.invitation_1 || this.metaData;
                    this.Update();

                    // 更新 title 后，需要修复 title 的高度，最多两行，超出截断
                    var titleHeight = this.titleUIObj.GetSize().height;
                    ArkWindow.console.log("titleHeight:", titleHeight);
                    if (ArkWindow.util.isiOS()) {
                        ArkWindow.console.log("isiOS");
                        if (titleHeight > 24) {
                            this.titleUIObj.SetStyle("display:block;height:15vw;margin:5 10 0 10;");
                        } else {
                            this.titleUIObj.SetStyle("display:block;height:7.5vw;margin:5 10 2 10;");
                        }
                    } else if (ArkWindow.util.isAndroid()) {
                        ArkWindow.console.log("isAndroid");
                        if (titleHeight > 23.3) {
                            this.titleUIObj.SetStyle("display:block;height:12.8vw;margin:5 10 2 10;");
                        } else {
                            this.titleUIObj.SetStyle("display:block;height:6.4vw;margin:5 10 4 10;");
                        }
                    }

                    // 夜间模式适配
                    this.darkModeAdapt();

                    // 曝光上报
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "expo",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: "",
                        reserves5: ArkWindow.util.getContainerInfo(self.view).group ? "group" : "c2c"
                    };
                    ArkWindow.report.compass(compassData, "dc04239");

                },
                Update: function() {
                    ArkWindow.console.log("Update img", this.metaData.icon);
                    if (this.metaData.icon) {
                        ArkWindow.util.setImage(this.metaData.icon, this.iconUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }
                    //按钮文案
                    if (this.metaData.shareTemplateId && this.metaData.shareTemplateData && this.metaData.shareTemplateData.bottomBtnTxt) {
                        ArkWindow.console.log("bottomBtn txt: ", this.metaData.shareTemplateData.bottomBtnTxt);
                        this.bottomBtnTxtUIObj.SetValue(this.metaData.shareTemplateData.bottomBtnTxt || "");
                        ArkWindow.console.log("display bottom btn");
                    } else {
                        this.bottomBtnTxtUIObj.SetValue("");
                        this.buttonWrapUIObj.SetStyle("flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:10");
                        ArkWindow.console.log("hide bottom btn");
                    }

                    this.nameUIObj.SetValue(this.metaData.name);
                    this.titleUIObj.SetValue(this.metaData.title);
                    this.footerTitleUIObj.SetValue(ArkWindow.util.getFootTitleByAppType(this.metaData.appType));
                    this.footIconUIObj.SetValue(ArkWindow.util.getFootIconByAppType(this.metaData.appType));
                    ArkWindow.console.log("Update img", this.metaData.imageUrl);
                    if (this.metaData.imageUrl) {
                        ArkWindow.util.setImage(this.metaData.imageUrl, this.imageUrlUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }
                },
                OnClick: function(sender, x, y, button, keyState) {
                    var self = this;
                    ArkWindow.console.log(appView + ' OnClick');
                    //上报到ark表
                    ArkWindow.util.Report(this.view.GetRoot().GetID(), 3, "Button.OnClick");
                    var url = this.metaData["path"];
                    url = ArkWindow.util.fixurl(url);
                    url = ArkWindow.util.getMiniAppUrl(url, self.metaData["scene"], self.view);
                    ArkWindow.console.log("OpenUrl url:", url);
                    ArkWindow.console.log("befor OpenUrl");
                    arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                    ArkWindow.console.log("after OpenUrl");
                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: "",
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                clickOriginWrapUI: function() {
                    ArkWindow.console.log("clickOriginWrapUI");
                    ArkWindow.console.log(this.metaData.appType);
                    if (Number(this.metaData.appType) === 0 || !this.metaData.appType) {
                        this.OnClick();
                        return;
                    }
                    var url = "mqqapi://hippy/open?bundleName=miniGameCenter";
                    arkWeb.QQ.OpenUrl(url, this.view.GetRoot());

                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click_minigamestore",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        touin: containerInfo.chatUIN,
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                // 修改背景颜色
                setBackgroundColor: function(color) {
                    this.originTexture.SetValue(color);
                    this.titleTexture.SetValue(color);
                    this.previewTexture.SetValue(color);
                    this.buttonTexture.SetValue(color);
                },
                darkModeAdapt: function() {
                    var isDarkMode = ArkWindow.theme.isDarkMode() || false;
                    ArkWindow.console.log('current mode is dark?:', isDarkMode);
                    if (isDarkMode) {
                        // 修改背景颜色
                        this.titleWrapTexture.SetValue(0xFF262626);
                        this.previewWrapTexture.SetValue(0xFF262626);
                        this.buttonContainTexture.SetValue(0xFF262626);
                        this.footerTexture.SetValue(0xFF2E2E2E);

                        // 修改字体颜色
                        this.nameUIObj.SetTextColor(0xFF666666);
                        this.titleUIObj.SetTextColor(0xFF999999);
                        this.bottomBtnTxtUIObj.SetTextColor(0xFF0066CC);
                        this.footerTitleUIObj.SetTextColor(0xFF666666);
                    }
                }
            }
        };
    })();

    var global$2 = ArkWindow;
    (function() {
        // 搞成闭包，避免污染全局变量
        var appView = "view_4473A8CC09D60E4199A9EF0437B14D50";
        global$2[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log("initialize " + appView);
                    this.view = view;
                    this.setvalue = false;
                    // demo数据
                    this.metaData = {
                        "appid": "1109595906", //小游戏appid
                        "icon": "https://miniapp.gtimg.cn/public/appicon/c755fac4b7473c4bb58726e30da3b60a_200.jpg", //小游戏的icon
                        "name": "垃圾分类管家", //小游戏名称
                        "title": "妈妈再也不用担心我倒错垃圾了", //小游戏转发标题
                        "imageUrl": "https://sola.gtimg.cn/aoi/sola/20200611201432_TVQLFtRsTk.png", //背景图片url
                        "path": "https://m.q.qq.com/a/s/a5a2744860397489cfcabe29667d9c9e", //转发路径
                        "scene": 1036, //场景值，用于上报
                        "host": {
                            "uin": 0, //模版发送人的uin，用于上报
                            "nick": ""
                        },
                        "shareTemplateId": "xxxxxxxxxxxxxx", //模版id
                        "shareTemplateData": { //模版id对应的内容
                            "bottomBtnTxt": "打开", // 底部按钮文案
                            "achievementGrade": 1, //过了多少关
                            "achievementUnit": "关" //单位
                        }
                    };

                    this.iconUIObj = view.GetUIObject("icon");
                    this.nameUIObj = view.GetUIObject("name");
                    this.titleUIObj = view.GetUIObject("title");
                    this.imageUrlUIObj = view.GetUIObject("imageUrl");
                    this.bottomBtnTxtUIObj = view.GetUIObject("bottomBtnTxt");
                    this.buttonWrapUIObj = view.GetUIObject("buttonWrap");

                    this.maskUIObj = view.GetUIObject("mask");
                    this.achieveUIObj = view.GetUIObject("achieve");
                    this.achieveTextUIObj = view.GetUIObject("achieveText");
                    this.achieveUnitUIObj = view.GetUIObject("achieveUnit");

                    this.titleWrapUIObj = view.GetUIObject("titleWrap");
                    this.titleWrapTexture = this.titleWrapUIObj.GetTexture("titleWrapTexture");
                    this.previewWrapUIObj = view.GetUIObject("previewWrap");
                    this.previewWrapTexture = this.previewWrapUIObj.GetTexture("previewWrapTexture");
                    this.buttonContainUIObj = view.GetUIObject("buttonContain");
                    this.buttonContainTexture = this.buttonContainUIObj.GetTexture("buttonContainTexture");
                    this.footerUIObj = view.GetUIObject("footer");
                    this.footerTexture = this.footerUIObj.GetTexture("footerTexture");
                    this.footerTitleUIObj = view.GetUIObject("footerTitle");
                    this.footIconUIObj = view.GetUIObject("footIcon");

                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();

                    // 绑定点击事件
                    var self = this;
                    this.titleWrapUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.previewWrapUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.buttonContainUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.footerUIObj.AttachEvent("OnClick", function() {
                        self.clickOriginWrapUI();
                    });
                },
                Deinitialize: function() {
                    ArkWindow.console.log("Deinitialize " + appView);
                },
                OnResize: function() {
                    ArkWindow.console.log("OnResize " + appView);
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    if (this.setvalue) {
                        return;
                    }
                    this.setvalue = true;
                    ArkWindow.console.log("OnSetValue", value, ArkWindow.app.config);
                    var self = this;
                    this.metaData = value.invitation_2 || this.metaData;
                    this.Update();

                    // 更新 title 后，需要修复 title 的高度，最多两行，超出截断
                    var titleHeight = this.titleUIObj.GetSize().height;
                    ArkWindow.console.log("titleHeight:", titleHeight);
                    if (ArkWindow.util.isiOS()) {
                        ArkWindow.console.log("isiOS");
                        if (titleHeight > 24) {
                            this.titleUIObj.SetStyle("display:block;height:15vw;margin:5 10 0 10;");
                        } else {
                            this.titleUIObj.SetStyle("display:block;height:7.5vw;margin:5 10 2 10;");
                        }
                    } else if (ArkWindow.util.isAndroid()) {
                        ArkWindow.console.log("isAndroid");
                        if (titleHeight > 23.3) {
                            this.titleUIObj.SetStyle("display:block;height:12.8vw;margin:5 10 2 10;");
                        } else {
                            this.titleUIObj.SetStyle("display:block;height:6.4vw;margin:5 10 4 10;");
                        }
                    }

                    // 夜间模式适配
                    this.darkModeAdapt();

                    // 曝光上报
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "expo",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: "",
                        reserves5: ArkWindow.util.getContainerInfo(self.view).group ? "group" : "c2c"
                    };
                    ArkWindow.report.compass(compassData, "dc04239");

                },
                Update: function() {
                    ArkWindow.console.log("Update img", this.metaData.icon);
                    if (this.metaData.icon) {
                        ArkWindow.util.setImage(this.metaData.icon, this.iconUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }

                    // 按钮文案
                    if (this.metaData.shareTemplateId && this.metaData.shareTemplateData && this.metaData.shareTemplateData.bottomBtnTxt) {
                        ArkWindow.console.log("bottomBtn txt: ", this.metaData.shareTemplateData.bottomBtnTxt);
                        this.bottomBtnTxtUIObj.SetValue(this.metaData.shareTemplateData.bottomBtnTxt || "");
                        ArkWindow.console.log("display bottom btn");
                    } else {
                        this.bottomBtnTxtUIObj.SetValue("");
                        this.buttonWrapUIObj.SetStyle("flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:10");
                        ArkWindow.console.log("hide bottom btn");
                    }

                    //成就相关
                    if (this.metaData.shareTemplateId && this.metaData.shareTemplateData && this.metaData.shareTemplateData.achievementGrade) {
                        ArkWindow.console.log("achievementGrade txt: ", this.metaData.shareTemplateData.achievementGrade);
                        ArkWindow.console.log("achieveUnit txt: ", this.metaData.shareTemplateData.achievementGrade);
                        this.achieveTextUIObj.SetValue(this.metaData.shareTemplateData.achievementGrade || "");
                        this.achieveUnitUIObj.SetValue(this.metaData.shareTemplateData.achievementUnit || "");
                        ArkWindow.console.log("display achievementGrade txt");
                    } else {
                        this.achieveTextUIObj.SetValue("");
                        this.achieveUnitUIObj.SetValue("");
                        this.maskUIObj.SetStyle("display:none;");
                        this.achieveUIObj.SetStyle("display:none;");
                        ArkWindow.console.log("hide achievementGrade bg");
                    }


                    this.nameUIObj.SetValue(this.metaData.name);
                    this.titleUIObj.SetValue(this.metaData.title);
                    this.footerTitleUIObj.SetValue(ArkWindow.util.getFootTitleByAppType(this.metaData.appType));
                    this.footIconUIObj.SetValue(ArkWindow.util.getFootIconByAppType(this.metaData.appType));
                    ArkWindow.console.log("Update img", this.metaData.imageUrl);
                    if (this.metaData.imageUrl) {
                        ArkWindow.util.setImage(this.metaData.imageUrl, this.imageUrlUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }
                },
                OnClick: function(sender, x, y, button, keyState) {
                    var self = this;
                    ArkWindow.console.log(appView + ' OnClick');
                    //上报到ark表
                    ArkWindow.util.Report(this.view.GetRoot().GetID(), 3, "Button.OnClick");
                    var url = this.metaData["path"];
                    url = ArkWindow.util.fixurl(url);
                    url = ArkWindow.util.getMiniAppUrl(url, self.metaData["scene"], self.view);
                    ArkWindow.console.log("OpenUrl url:", url);
                    ArkWindow.console.log("befor OpenUrl");
                    arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                    ArkWindow.console.log("after OpenUrl");
                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: "",
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                clickOriginWrapUI: function() {
                    ArkWindow.console.log("clickOriginWrapUI");
                    ArkWindow.console.log(this.metaData.appType);
                    if (Number(this.metaData.appType) === 0 || !this.metaData.appType) {
                        this.OnClick();
                        return;
                    }
                    var url = "mqqapi://hippy/open?bundleName=miniGameCenter";
                    arkWeb.QQ.OpenUrl(url, this.view.GetRoot());

                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click_minigamestore",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        touin: containerInfo.chatUIN,
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                darkModeAdapt: function() {
                    var isDarkMode = ArkWindow.theme.isDarkMode() || false;
                    ArkWindow.console.log('current mode is dark?:', isDarkMode);
                    if (isDarkMode) {
                        // 修改背景颜色
                        this.titleWrapTexture.SetValue(0xFF262626);
                        this.previewWrapTexture.SetValue(0xFF262626);
                        this.buttonContainTexture.SetValue(0xFF262626);
                        this.footerTexture.SetValue(0xFF2E2E2E);

                        // 修改字体颜色
                        this.nameUIObj.SetTextColor(0xFF666666);
                        this.titleUIObj.SetTextColor(0xFF999999);
                        this.bottomBtnTxtUIObj.SetTextColor(0xFF0066CC);
                        this.footerTitleUIObj.SetTextColor(0xFF666666);
                    }
                }
            }
        };
    })();

    var global$1 = ArkWindow;
    (function() {
        // 搞成闭包，避免污染全局变量
        var appView = "view_472ADE9D43609B0F5AB20E86B765EEA3";
        global$1[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log("initialize " + appView);
                    this.view = view;
                    this.setvalue = false;

                    // demo数据
                    this.metaData = {
                        "appid": "1109595906", //小游戏appid
                        "icon": "https://miniapp.gtimg.cn/public/appicon/c755fac4b7473c4bb58726e30da3b60a_200.jpg", //小游戏的icon
                        "name": "垃圾分类管家", //小游戏名称
                        "title": "妈妈再也不用担心我", //小游戏转发标题
                        "imageUrl": "https://sola.gtimg.cn/aoi/sola/20200611201432_TVQLFtRsTk.png", //背景图片url
                        "path": "https://m.q.qq.com/a/s/a5a2744860397489cfcabe29667d9c9e",
                        "appType": 0, // 0 小程序， 1 小游戏                                //转发路径
                        "scene": 1036, //场景值，用于上报
                        "host": {
                            "uin": 0, //模版发送人的uin，用于上报
                            "nick": ""
                        },
                        "shareTemplateId": "xxxxxxxxxxxxxx", //模版id
                        "shareTemplateData": { //模版id对应的内容
                            "bottomBtnTxt": "打开", // 底部按钮文案
                            "giftList": [ //礼包列表
                                {
                                    "giftName": "露娜",
                                    "giftImg": "https://sola.gtimg.cn/aoi/sola/20200612152246_qBuoWIP9OK.png"
                                },
                                {
                                    "giftName": "露娜",
                                    "giftImg": "https://sola.gtimg.cn/aoi/sola/20200612152246_qBuoWIP9OK.png"
                                },
                                {
                                    "giftName": "露娜",
                                    "giftImg": "https://sola.gtimg.cn/aoi/sola/20200612152246_qBuoWIP9OK.png"
                                }
                            ]
                        }
                    };

                    this.iconUIObj = view.GetUIObject("icon");
                    this.nameUIObj = view.GetUIObject("name");
                    this.titleUIObj = view.GetUIObject("title");
                    this.imageUrlUIObj = view.GetUIObject("imageUrl");
                    this.bottomBtnTxtUIObj = view.GetUIObject("bottomBtnTxt");
                    this.buttonWrapUIObj = view.GetUIObject("buttonWrap");

                    this.maskUIObj = view.GetUIObject("mask");

                    this.gift1UIObj = view.GetUIObject("gift1");
                    this.gift2UIObj = view.GetUIObject("gift2");
                    this.gift3UIObj = view.GetUIObject("gift3");

                    this.gift1ImgUIObj = view.GetUIObject("gift1Img");
                    this.gift1TextUIObj = view.GetUIObject("gift1Text");
                    this.gift2ImgUIObj = view.GetUIObject("gift2Img");
                    this.gift2TextUIObj = view.GetUIObject("gift2Text");
                    this.gift3ImgUIObj = view.GetUIObject("gift3Img");
                    this.gift3TextUIObj = view.GetUIObject("gift3Text");

                    this.titleWrapUIObj = view.GetUIObject("titleWrap");
                    this.titleWrapTexture = this.titleWrapUIObj.GetTexture("titleWrapTexture");
                    this.previewWrapUIObj = view.GetUIObject("previewWrap");
                    this.previewWrapTexture = this.previewWrapUIObj.GetTexture("previewWrapTexture");
                    this.buttonContainUIObj = view.GetUIObject("buttonContain");
                    this.buttonContainTexture = this.buttonContainUIObj.GetTexture("buttonContainTexture");
                    this.footerUIObj = view.GetUIObject("footer");
                    this.footerTexture = this.footerUIObj.GetTexture("footerTexture");
                    this.footerTitleUIObj = view.GetUIObject("footerTitle");
                    this.footIconUIObj = view.GetUIObject("footIcon");

                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();

                    // 绑定点击事件
                    var self = this;
                    this.titleWrapUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.previewWrapUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.buttonContainUIObj.AttachEvent("OnClick", function() {
                        self.OnClick();
                    });
                    this.footerUIObj.AttachEvent("OnClick", function() {
                        self.clickOriginWrapUI();
                    });
                },
                Deinitialize: function() {
                    ArkWindow.console.log("Deinitialize " + appView);
                },
                OnResize: function() {
                    ArkWindow.console.log("OnResize " + appView);
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    if (this.setvalue) {
                        return;
                    }
                    this.setvalue = true;

                    ArkWindow.console.log("OnSetValue", value, ArkWindow.app.config);
                    var self = this;
                    this.metaData = value.invitation_3 || this.metaData;
                    this.Update();

                    // 更新 title 后，需要修复 title 的高度，最多两行，超出截断
                    var titleHeight = this.titleUIObj.GetSize().height;
                    ArkWindow.console.log("titleHeight:", titleHeight);
                    if (ArkWindow.util.isiOS()) {
                        ArkWindow.console.log("isiOS");
                        if (titleHeight > 24) {
                            this.titleUIObj.SetStyle("display:block;height:15vw;margin:5 10 0 10;");
                        } else {
                            this.titleUIObj.SetStyle("display:block;height:7.5vw;margin:5 10 2 10;");
                        }
                    } else if (ArkWindow.util.isAndroid()) {
                        ArkWindow.console.log("isAndroid");
                        if (titleHeight > 23.3) {
                            this.titleUIObj.SetStyle("display:block;height:12.8vw;margin:5 10 2 10;");
                        } else {
                            this.titleUIObj.SetStyle("display:block;height:6.4vw;margin:5 10 4 10;");
                        }
                    }

                    // 夜间模式适配
                    this.darkModeAdapt();

                    // 曝光上报
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "expo",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: "",
                        reserves5: ArkWindow.util.getContainerInfo(self.view).group ? "group" : "c2c"
                    };
                    ArkWindow.report.compass(compassData, "dc04239");

                },
                Update: function() {
                    ArkWindow.console.log("Update img", this.metaData.icon);
                    if (this.metaData.icon) {
                        ArkWindow.util.setImage(this.metaData.icon, this.iconUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }

                    // 按钮文案
                    if (this.metaData.shareTemplateId && this.metaData.shareTemplateData && this.metaData.shareTemplateData.bottomBtnTxt) {
                        ArkWindow.console.log("bottomBtn txt: ", this.metaData.shareTemplateData.bottomBtnTxt);
                        this.bottomBtnTxtUIObj.SetValue(this.metaData.shareTemplateData.bottomBtnTxt || "");
                        ArkWindow.console.log("display bottom btn");
                    } else {
                        this.bottomBtnTxtUIObj.SetValue("");
                        this.buttonWrapUIObj.SetStyle("flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:10");
                        ArkWindow.console.log("hide bottom btn");
                    }

                    //奖品相关
                    if (this.metaData.shareTemplateId && this.metaData.shareTemplateData && this.metaData.shareTemplateData.giftList && this.metaData.shareTemplateData.giftList.length) {
                        ArkWindow.console.log("giftList:", this.metaData.shareTemplateData.giftList);
                        var giftList = this.metaData.shareTemplateData.giftList;
                        for (var i = 0; i < 3; i++) {
                            if (giftList[i] && giftList[i].giftImg) {
                                ArkWindow.console.log(this["gift" + (i + 1) + "UIObj"]);
                                this["gift" + (i + 1) + "UIObj"].SetStyle("display:flex;flexDirection:column;alignItems:center;");
                                this["gift" + (i + 1) + "TextUIObj"].SetValue(giftList[i].giftName || "");
                                ArkWindow.util.setImage(giftList[i].giftImg, this["gift" + (i + 1) + "ImgUIObj"], function(err) {
                                    if (err) {
                                        ArkWindow.console.error("set Image error", err);
                                    }
                                });
                            } else {
                                this["gift" + (i + 1) + "UIObj"].SetStyle("display:none;");
                            }
                        }
                        ArkWindow.console.log("display giftList");
                    } else {
                        this.maskUIObj.SetStyle("display:none;");
                        this["gift1UIObj"].SetStyle("display:none;");
                        this["gift2UIObj"].SetStyle("display:none;");
                        this["gift3UIObj"].SetStyle("display:none;");
                        ArkWindow.console.log("hide giftList");
                    }


                    this.nameUIObj.SetValue(this.metaData.name);
                    this.titleUIObj.SetValue(this.metaData.title);
                    this.footerTitleUIObj.SetValue(ArkWindow.util.getFootTitleByAppType(this.metaData.appType));
                    this.footIconUIObj.SetValue(ArkWindow.util.getFootIconByAppType(this.metaData.appType));
                    ArkWindow.console.log("Update img", this.metaData.imageUrl);
                    if (this.metaData.imageUrl) {
                        ArkWindow.util.setImage(this.metaData.imageUrl, this.imageUrlUIObj, function(err) {
                            if (err) {
                                ArkWindow.console.error("set Image error", err);
                            }
                        });
                    }
                },
                OnClick: function(sender, x, y, button, keyState) {
                    var self = this;
                    ArkWindow.console.log(appView + ' OnClick');
                    //上报到ark表
                    ArkWindow.util.Report(this.view.GetRoot().GetID(), 3, "Button.OnClick");
                    var url = this.metaData["path"];
                    url = ArkWindow.util.fixurl(url);
                    url = ArkWindow.util.getMiniAppUrl(url, self.metaData["scene"], self.view);
                    ArkWindow.console.log("OpenUrl url:", url);
                    ArkWindow.console.log("befor OpenUrl");
                    arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                    ArkWindow.console.log("after OpenUrl");
                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves4: "",
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                clickOriginWrapUI: function() {
                    ArkWindow.console.log("clickOriginWrapUI");
                    ArkWindow.console.log(this.metaData.appType);
                    if (Number(this.metaData.appType) === 0 || !this.metaData.appType) {
                        this.OnClick();
                        return;
                    }
                    var url = "mqqapi://hippy/open?bundleName=miniGameCenter";
                    arkWeb.QQ.OpenUrl(url, this.view.GetRoot());

                    // 点击上报
                    var containerInfo = ArkWindow.util.getContainerInfo(this.view);
                    var compassData = {
                        uin: this.metaData.host && this.metaData.host.uin || "",
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: "ark",
                        sub_actiontype: "ark_share",
                        reserves_action: "click_minigamestore",
                        reserves2: "com.tencent.miniapp_01",
                        reserves3: appView,
                        reserves5: ArkWindow.util.getChatTypeName(containerInfo.chatType),
                        touin: containerInfo.chatUIN,
                        app_type: this.metaData.appType || 0,
                    };
                    ArkWindow.report.compass(compassData, "dc04239");
                },
                darkModeAdapt: function() {
                    var isDarkMode = ArkWindow.theme.isDarkMode() || false;
                    ArkWindow.console.log('current mode is dark?:', isDarkMode);
                    if (isDarkMode) {
                        // 修改背景颜色
                        this.titleWrapTexture.SetValue(0xFF262626);
                        this.previewWrapTexture.SetValue(0xFF262626);
                        this.buttonContainTexture.SetValue(0xFF262626);
                        this.footerTexture.SetValue(0xFF2E2E2E);

                        // 修改字体颜色
                        this.nameUIObj.SetTextColor(0xFF666666);
                        this.titleUIObj.SetTextColor(0xFF999999);
                        this.bottomBtnTxtUIObj.SetTextColor(0xFF0066CC);
                        this.footerTitleUIObj.SetTextColor(0xFF666666);
                    }
                }
            }
        };
    })();

    var global = ArkWindow;
    (function() {
        // 搞成闭包，避免污染全局变量
        var appView = 'view_A5D6E190E8364AB2AF4BF9F53A9BE1DC';
        global[appView] = {
            appView: appView,
            ViewModel: {
                New: function(view) {
                    var model = Object.create(this);
                    model.Initialize(view);
                    return model;
                },
                Initialize: function(view) {
                    ArkWindow.console.log('initialize ' + appView);
                    this.view = view;
                    this.setvalue = false;

                    // demo数据
                    this.metaData = {
                        appid: '1110285175', //小游戏appid
                        icon: 'https://miniapp.gtimg.cn/public/appicon/c755fac4b7473c4bb58726e30da3b60a_200.jpg', //小游戏的icon
                        name: '群橱窗', //小游戏名称
                        title: '妈妈再也不用担心我', //小游戏转发标题
                        imageUrl: 'https://sola.gtimg.cn/aoi/sola/20200611201432_TVQLFtRsTk.png', //背景图片url
                        path: 'https://m.q.qq.com/a/s/a5a2744860397489cfcabe29667d9c9e', //转发路径
                        scene: 1036, //场景值，用于上报
                        host: {
                            uin: 0, //模版发送人的uin，用于上报
                            nick: '',
                        },
                        shareTemplateId: 'xxxxxxxxxxxxxx', // 模版id
                        shareTemplateData: {
                            // 模版id对应的内容
                            bottomBtnTxt: '呵呵呵www', // 底部按钮文案
                            productList: [], // 商品列表 字段名直接用源数据
                        },
                    };

                    this.titleUIObj = view.GetUIObject('title');
                    this.imageUrlUIObj = view.GetUIObject('imageUrl');
                    this.bottomBtnTxtUIObj = view.GetUIObject('bottomBtnTxt');
                    this.buttonWrapUIObj = view.GetUIObject('buttonWrap');

                    this.item0UIObj = view.GetUIObject('item-0');
                    this.item1UIObj = view.GetUIObject('item-1');
                    this.item2UIObj = view.GetUIObject('item-2');

                    this.item0ImgUIObj = view.GetUIObject('item-0-image');
                    this.item0TextUIObj = view.GetUIObject('item-0-text');
                    this.item1ImgUIObj = view.GetUIObject('item-1-image');
                    this.item1TextUIObj = view.GetUIObject('item-1-text');
                    this.item2ImgUIObj = view.GetUIObject('item-2-image');
                    this.item2TextUIObj = view.GetUIObject('item-2-text');

                    var viewSize = this.view.GetSize();
                    this.OnResize(viewSize.width, viewSize.height);
                    this.Update();
                },
                Deinitialize: function() {
                    ArkWindow.console.log('Deinitialize ' + appView);
                },
                OnResize: function() {
                    ArkWindow.console.log('OnResize ' + appView);
                    this.Update();
                },
                OnSetValue: function(sender, value) {
                    if (this.setvalue) {
                        return;
                    }
                    this.setvalue = true;

                    ArkWindow.console.log('OnSetValue', value, ArkWindow.app.config);
                    var self = this;
                    this.metaData = value.invitation_gshop || this.metaData;
                    this.Update();

                    // 曝光上报
                    var compassData = {
                        uin: (this.metaData.host && this.metaData.host.uin) || '',
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: 'ark',
                        sub_actiontype: 'ark_share',
                        reserves_action: 'expo',
                        reserves2: 'com.tencent.miniapp_01',
                        reserves3: appView,
                        reserves4: '',
                        reserves5: ArkWindow.util.getContainerInfo(self.view).group ? 'group' : 'c2c',
                    };
                    ArkWindow.report.compass(compassData, 'dc04239');
                },
                Update: function() {
                    // 按钮文案
                    if (
                        this.metaData.shareTemplateId &&
                        this.metaData.shareTemplateData &&
                        this.metaData.shareTemplateData.bottomBtnTxt
                    ) {
                        ArkWindow.console.log(
                            'bottomBtn txt: ',
                            this.metaData.shareTemplateData.bottomBtnTxt
                        );
                        this.bottomBtnTxtUIObj.SetValue(
                            this.metaData.shareTemplateData.bottomBtnTxt || ''
                        );
                        ArkWindow.console.log('display bottom btn');
                    } else {
                        this.bottomBtnTxtUIObj.SetValue('');
                        this.buttonWrapUIObj.SetStyle(
                            'flex:1;display:flex;flexDirection:row;alignItems:center;justifyContent:center;paddingTop:10'
                        );
                        ArkWindow.console.log('hide bottom btn');
                    }

                    //奖品相关
                    if (
                        this.metaData.shareTemplateId &&
                        this.metaData.shareTemplateData &&
                        this.metaData.shareTemplateData.productList &&
                        this.metaData.shareTemplateData.productList.length
                    ) {
                        ArkWindow.console.log(
                            'productList:',
                            this.metaData.shareTemplateData.productList
                        );

                        var productList = this.metaData.shareTemplateData.productList;

                        for (var i = 0; i < 3; i++) {
                            const itemUIObj = this['item' + i + 'UIObj'];
                            const itemTextObj = this['item' + i + 'TextUIObj'];
                            const priceTextObj = itemTextObj.GetChild('price');

                            if (productList[i] && productList[i].img) {
                                const {
                                    title = '', sales = 0, price, ori_price = 0, url
                                } = productList[i];

                                itemUIObj.SetStyle(
                                    'display:flex;flexDirection:row;alignItems:center;justifyContent:space-between;marginTop:10'
                                );

                                itemUIObj.AttachEvent('OnClick', function(view) {
                                    ArkWindow.console.log(url + ' OnItemClick');
                                    url && arkWeb.QQ.OpenUrl(ArkWindow.util.fixurl(url));
                                });


                                itemTextObj.SetValue({
                                    ['item-' + i + '-title']: title
                                });

                                if (sales > 0) { //销量大于 0 才展示
                                    itemTextObj.SetValue({
                                        ['item-' + i + '-sales']: '销量' + sales + '件'
                                    });
                                }

                                if (!price) {
                                    priceTextObj.SetStyle('display:none;');
                                }

                                priceTextObj.SetValue({
                                    ['item-' + i + '-price']: '￥' + price,
                                    ['item-' + i + '-priceInt']: parseInt(price / 100, 10),
                                    ['item-' + i + '-priceFloat']: String(price).substr(-2)
                                });

                                if (ori_price != null && price != ori_price) { // 原价不等于现价才展示
                                    priceTextObj.SetValue({
                                        ['item-' + i + '-oprice']: '原价: ￥' + ori_price
                                    });
                                }

                                ArkWindow.util.setImage(
                                    productList[i].img,
                                    this['item' + i + 'ImgUIObj'],
                                    function(err) {
                                        if (err) {
                                            ArkWindow.console.error('set Image error', err);
                                        }
                                    }
                                );
                            } else {
                                itemUIObj.SetStyle('display:none;');
                            }
                        }
                        ArkWindow.console.log('display productList');
                    } else {
                        this['item0UIObj'].SetStyle('display:none;');
                        this['item1UIObj'].SetStyle('display:none;');
                        this['item2UIObj'].SetStyle('display:none;');
                        ArkWindow.console.log('hide productList');
                    }
                },
                OnClick: function(sender, x, y, button, keyState) {
                    var self = this;
                    //上报到ark表
                    ArkWindow.util.Report(this.view.GetRoot().GetID(), 3, 'Button.OnClick');
                    var url = this.metaData['path'];
                    url = ArkWindow.util.fixurl(url);
                    url = ArkWindow.util.getMiniAppUrl(url, self.metaData['scene'], self.view);
                    ArkWindow.console.log('OpenUrl url:', url);
                    ArkWindow.console.log('befor OpenUrl');
                    arkWeb.QQ.OpenUrl(url, self.view.GetRoot());
                    ArkWindow.console.log('after OpenUrl');
                    // 点击上报
                    var compassData = {
                        uin: (this.metaData.host && this.metaData.host.uin) || '',
                        appid: this.metaData.appid,
                        refer: this.metaData.scene,
                        actiontype: 'ark',
                        sub_actiontype: 'ark_share',
                        reserves_action: 'click',
                        reserves2: 'com.tencent.miniapp_01',
                        reserves3: appView,
                        reserves4: '',
                        reserves5: ArkWindow.util.getContainerInfo(self.view).group ? 'group' : 'c2c',
                    };
                    ArkWindow.report.compass(compassData, 'dc04239');
                },
            },
        };
    })();

    ArkGlobalContext._setViewTemplate('invitation.xml', `<View id="invitation" style="display:flex;flexDirection:column;width:66vw;height:64vw;">
    <Texture color="0xFFFFFFFF"></Texture>
	<View id="appInfoWrap" style="display:flex;justifyContent:space-between;alignItems:center;marginLeft:3.2vw;marginTop:3.2vw;marginRight:3.2vw;">
        <View id="appInfo" style="display:flex;alignItems:center;">
            <Image id="appLogo" style="display:block;width:20;height:20;flexShrink:0;marginRight:2.1333vw;" radius="3,3,3,3" value="https://placehold.it/40"></Image>
            <Text id="appName" textcolor="0xFF878B99" font="size.14" autosize="true" ellipsis="true" value="&#x5C0F;&#x7A0B;&#x5E8F;&#x6807;&#x9898;"></Text>
        </View>
        <View id="appMoreInfo" style="width:4.2666vw;height:4.2666vw;flexShrink:0;">
            <Image stretch="1" anchors="15" radius="3,3,3,3" value="image/more.png"></Image>
        </View>
    </View>
    <View id="appMsgTitleWrap" style="display:block;marginLeft:3.2vw;marginTop:1.6vw;marginRight:3.2vw;">
        <Text id="appMsgTitle" textcolor="0xFF03081A" font="size.17" autosize="true" ellipsis="true" value="&#x6765;&#x81EA;&#x9C7C;&#x5B50;&#x9171;&#x7684;&#x9080;&#x8BF7;"></Text>
    </View>
    <View id="appMsgContentWrap" style="display:flex;flexDirection:column;justifyContent:center;alignItems:center;marginTop:2.1333vw;flex:1;">
        <View id="splitLine" style="position:absolute;left:0;top:0;right:0;height:.5;"><Texture color="0xFFEBEDF5"></Texture></View>
        <Image id="appMsgImage" style="display:block;width:64;height:64;marginBottom:11;" radius="32,32,32,32" value="https://placehold.it/130"></Image>
        <Text id="appMsgContent" textcolor="0xFF878B99" font="size.12" autosize="true" ellipsis="true" value="&#x6765;&#x81EA;&#x9C7C;&#x5B50;&#x9171;&#x7684;&#x9080;&#x8BF7;"></Text>
    </View>
    <View id="appMsgActionWrap" style="display:flex;justifyContent:center;paddingTop:15;paddingBottom:15;">
        <View id="splitLine" style="position:absolute;left:0;top:0;right:0;height:.5;"><Texture color="0xFFEBEDF5"></Texture></View>
        <Text id="appMsgAction" textcolor="0xFF03081A" font="size.14" autosize="true" ellipsis="true" value="&#x5E94;&#x9080;&#x524D;&#x5F80;&#x5C0F;&#x6E38;&#x620F;"></Text>
    </View>
</View>

`);

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
      var appKey = '4ff195c8c387ba6859d8ce9595420d92';


      return {
        appid: 'com.tencent.miniapp_01',
        appKey,
        images: [{"name":"image/icon-minigame@2x.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIjSURBVHgB7VVLbtNQFD3PcVHFBO+AsIN0B+kSWAFhAlQMSFdAu4KIAaoaBm5XQFhB2AFhBZgVECaoioIv576P/Z6Tin4Glaoeyfb73Hfu/xl4wF3DbKycyAg9vIBgwFmBq8JgwfcHvDJn6XKMT/IeNY5wG6iiHezjpVnqNG821HJHrhvHeISzIPRflFLggh5nKK3nK4y5epQKTWWOUxF+R7gpTmRoOU7lW1hqPRAM7XcHs8SyNS1ao8KBqbYQ9pmvgnFf2Pkuw7Oyo0EQyRpBhyoJi5LXmJNkuEH+UTQkcxpWNmvubBVzZt4Pp8D4TcVUZiQvvXcTzsuEPCe5VlmN54lig6U3fdAqWHsFiBTUHAdhl/jfzd5bhqTGF6sgZ0nHEHz3iopWQeYVCH42gm/MmEKHXviYcR4nRAdGq+6cxj1DispzWc7cEwy4oFgkojnnF6zp3c56rKQL9TyznE9bBcATv5nWvUvaV1wHPRoj1oMoB9KUVYXb4m9jpM2Buyq0ORSvjdl6SPthhRGl+96git7OtvZGhy9LLNdO3BSekPwXRxMSv7OPjjP8sHdXF1NJohEUnNt3jwdD06nVrvZD9WiHH/rHyevdpTLhjH4Fn+3YuNyZKAR6f/T95sKXmcZxyVLct7UfI242ldEmjXNZ8wxD6DzQatGFYFn4F6gVNfY2yBWu2fa8pUVEPgvkrQcx1Js/tD6jVZcl8bIzjzt32b3AP1ul1qaS8t9kAAAAAElFTkSuQmCC"},{"name":"image/icon-miniprogram@2x.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABKNJREFUSA21VV1oHFUUvufO/szMboSkmzRNg5ZWqzQaiIoWrEqUulkUfRCxKD5YfVPsgwR8EBWF+tBHW6EiiigifVDwZbNtalooPigUbVOtLY2itTRms7GxuzOTzNzjd6aZOKxLC4IX7s6599xzvnu+c+5Zpf7nQWn/fYf9TVHINxCZ0/WHChfSuv8qrwL0HPSeVxHvV8o0lSJLaf1xz0Z7V2Ne5fWCf7vRPEKssoqUR0zTlLe/nRuly9cCjgH6J4KhJQ6ncXgJU2NmiCjAd1nBKRP7ZCjHGvusQqxFZ0NXzeSs8T8etM9h3XGIM3gxjzHRMsRcsej2KdLHGDJmgRVncQtWGhCsjFGAYbYUU04RPRoumxM9Ne+tjt6xGQMQm3kYC4C63PS+goO7IDIcRAD+TGvr6VxWDc1XXLtA7kDG0hXoD+BEgGmz4fHuidZesW8fMUUDU1zy/dYcHOLCTOIYkp/RdNts2fm53ShZl6r+zYbMl1hvAJDc9tV6xd2T6OUbR3BhlOqWlR2JnV/RasD8bogy6cPtcr1i/6SLzp24TARdxpB6fW0tuDV9LgaQjTBafkNujgqCX+Vja1MURd+B351pg3a5vo3+ymS1ODWY+dBEr6TPxBT1TnExCkCR0llmBud0iI15F8nOIyofgFNdeeeZX0bpz7RxWu6utT4hwzvAb8jdTl9jKy2KPo7ABMFWVIWnOGqBlL3zZecjlN8wauYMck3gd/sl3zvbe8jblnaalrWiD7DGu2BfL/ojiW6FInMLeLTjG3c5P4hSanvYcYdRnohERUApRRHX1lSbu5+QMm0b/YP2MVBcAMU5Y7gdQLnyiGBjJaGJ/ZFRChtldxwv92EYNnAJC05eOjzhHe+vehvkTDJODdESIpXiyID3XLIfR4AKC2AcYtMMneJVZXKoXnGOuOTchBo+ihwBi7YsKTNdqrV2JGckj5BDMvCDEk/2YwDwdwLI8vybs7/59yTK9Pf8GDUalUJZW+plJB4thRw26v2eWutAXCShh0piH0ygKOhkYhsDXGfZx7GB3sJdeGE7E2WnL7rsftLWHYhjBhGhgahHosA7qwy9hhwiB+xII0xsY4CZ7XQJYX0hm+Dv8bWT/sbkQKfvfDl/euB6ZwhtRCpHXn8/5piYo79MpLtsDCBOstraDW59PJf8cmi+X+FUVB2HJHVhzH1RoU/hgLxkQBmNTrgulld+VgFmy/lp3P5NzAAgORP435Qm/c3pw+1yHKmJPsVzihABTIHB6u7uanMfiiFexz9pw+5qax9QnwXHeexL0j7XrN6hovOjtAWpMikE5Oo58PGU2MKJhz7xITE/iXdTAGkIhTfLv+K/AMRgTbX1NgB2wTInDxkMtHBLGwIKTnoOt7CPssSDQwfG2SVUzgu4iDZs3pO1paxhaYYdAQSkd8K/MVTRHjyyMrLow3MO/2SICi3lCudZ3PYo/mbvB5Aj4HAWIPFZyBcbY+56fCW6q4/Br9nxF4MH4GQd2vF60DJjEZ8zBeekUFY62Bwwhs6jyTXBDHJBTq7gDF68j+bE8zUBrg7/j7ZnMthCUdRVcJ0zv95LC4nmb2f892O3j+zvAAAAAElFTkSuQmCC"},{"name":"image/icon.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.miniapp_01/image/icon.png"},{"name":"image/integral_icon.png","url":"data:image/png;base64,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"},{"name":"image/invitationAchieveBg.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.miniapp_01/image/invitationAchieveBg.png"},{"name":"image/invitationBgMask.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcYAAAEACAYAAAAp09aAAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABxqADAAQAAAABAAABAAAAAAAnFANdAAAK4ElEQVR4Ae3bPWoWaBSG4UQHUtgFqzQjYmVtKVi7gGF2MVuaBbiKQLq0EnQDKdMHNHpOJoYbxhXkuz54x0eZJhcHbvzJ8dH/P2fzS+/nvZ13Ou9kng8BAgQIEHgqArfzhdzMu5p3Me963uPn+HEdHf0x+695H+b11/O/mAQIECBA4EkJ/Jiv5nzep3nf9it7vv+Zz0bxn3nv5oniIPgQIECAwEEIbPNezXsz73Le3a8w/j0/2Sj6ECBAgACBQxR4OV/0i3mfn81/9u8U949PfQgQIECAwCELbAvP9neMH+e9PmQJXzsBAgQIEBiB/WPV7/s7xv3Xpz4ECBAgQIDANHHDuN+S4UOAAAECBAhMEzeMvk/RKRAgQIAAgf8ETjaMPgQIECBAgMCDgDA6BQIECBAgEAFhDIZJgAABAgSE0Q0QIECAAIEICGMwTAIECBAgIIxugAABAgQIREAYg2ESIECAAAFhdAMECBAgQCACwhgMkwABAgQICKMbIECAAAECERDGYJgECBAgQEAY3QABAgQIEIiAMAbDJECAAAECwugGCBAgQIBABIQxGCYBAgQIEBBGN0CAAAECBCIgjMEwCRAgQICAMLoBAgQIECAQAWEMhkmAAAECBITRDRAgQIAAgQgIYzBMAgQIECAgjG6AAAECBAhEQBiDYRIgQIAAAWF0AwQIECBAIALCGAyTAAECBAgIoxsgQIAAAQIREMZgmAQIECBAQBjdAAECBAgQiIAwBsMkQIAAAQLC6AYIECBAgEAEhDEYJgECBAgQEEY3QIAAAQIEIiCMwTAJECBAgIAwugECBAgQIBABYQyGSYAAAQIEhNENECBAgACBCAhjMEwCBAgQICCMboAAAQIECERAGINhEiBAgAABYXQDBAgQIEAgAsIYDJMAAQIECAijGyBAgAABAhEQxmCYBAgQIEBAGN0AAQIECBCIgDAGwyRAgAABAsLoBggQIECAQASEMRgmAQIECBAQRjdAgAABAgQiIIzBMAkQIECAgDC6AQIECBAgEAFhDIZJgAABAgSE0Q0QIECAAIEICGMwTAIECBAgIIxugAABAgQIREAYg2ESIECAAAFhdAMECBAgQCACwhgMkwABAgQICKMbIECAAAECERDGYJgECBAgQEAY3QABAgQIEIiAMAbDJECAAAECwugGCBAgQIBABIQxGCYBAgQIEBBGN0CAAAECBCIgjMEwCRAgQICAMLoBAgQIECAQAWEMhkmAAAECBITRDRAgQIAAgQgIYzBMAgQIECAgjG6AAAECBAhEQBiDYRIgQIAAAWF0AwQIECBAIALCGAyTAAECBAgIoxsgQIAAAQIREMZgmAQIECBAQBjdAAECBAgQiIAwBsMkQIAAAQLC6AYIECBAgEAEhDEYJgECBAgQEEY3QIAAAQIEIiCMwTAJECBAgIAwugECBAgQIBABYQyGSYAAAQIEhNENECBAgACBCAhjMEwCBAgQICCMboAAAQIECERAGINhEiBAgAABYXQDBAgQIEAgAsIYDJMAAQIECAijGyBAgAABAhEQxmCYBAgQIEBAGN0AAQIECBCIgDAGwyRAgAABAsLoBggQIECAQASEMRgmAQIECBAQRjdAgAABAgQiIIzBMAkQIECAgDC6AQIECBAgEAFhDIZJgAABAgSE0Q0QIECAAIEICGMwTAIECBAgIIxugAABAgQIREAYg2ESIECAAAFhdAMECBAgQCACwhgMkwABAgQICKMbIECAAAECERDGYJgECBAgQEAY3QABAgQIEIiAMAbDJECAAAECwugGCBAgQIBABIQxGCYBAgQIEBBGN0CAAAECBCIgjMEwCRAgQICAMLoBAgQIECAQAWEMhkmAAAECBITRDRAgQIAAgQgIYzBMAgQIECAgjG6AAAECBAhEQBiDYRIgQIAAAWF0AwQIECBAIALCGAyTAAECBAgIoxsgQIAAAQIREMZgmAQIECBAQBjdAAECBAgQiIAwBsMkQIAAAQLC6AYIECBAgEAEhDEYJgECBAgQEEY3QIAAAQIEIiCMwTAJECBAgIAwugECBAgQIBABYQyGSYAAAQIEhNENECBAgACBCAhjMEwCBAgQICCMboAAAQIECERAGINhEiBAgAABYXQDBAgQIEAgAsIYDJMAAQIECAijGyBAgAABAhEQxmCYBAgQIEBAGN0AAQIECBCIgDAGwyRAgAABAsLoBggQIECAQASEMRgmAQIECBAQRjdAgAABAgQiIIzBMAkQIECAgDC6AQIECBAgEAFhDIZJgAABAgSE0Q0QIECAAIEICGMwTAIECBAgIIxugAABAgQIREAYg2ESIECAAAFhdAMECBAgQCACwhgMkwABAgQICKMbIECAAAECERDGYJgECBAgQEAY3QABAgQIEIiAMAbDJECAAAECwugGCBAgQIBABIQxGCYBAgQIEBBGN0CAAAECBCIgjMEwCRAgQICAMLoBAgQIECAQAWEMhkmAAAECBITRDRAgQIAAgQgIYzBMAgQIECAgjG6AAAECBAhEQBiDYRIgQIAAAWF0AwQIECBAIALCGAyTAAECBAgIoxsgQIAAAQIREMZgmAQIECBAQBjdAAECBAgQiIAwBsMkQIAAAQLC6AYIECBAgEAEhDEYJgECBAgQEEY3QIAAAQIEIiCMwTAJECBAgIAwugECBAgQIBABYQyGSYAAAQIEhNENECBAgACBCAhjMEwCBAgQICCMboAAAQIECERAGINhEiBAgAABYXQDBAgQIEAgAsIYDJMAAQIECAijGyBAgAABAhEQxmCYBAgQIEBAGN0AAQIECBCIgDAGwyRAgAABAsLoBggQIECAQASEMRgmAQIECBAQRjdAgAABAgQiIIzBMAkQIECAgDC6AQIECBAgEAFhDIZJgAABAgSE0Q0QIECAAIEICGMwTAIECBAgIIxugAABAgQIREAYg2ESIECAAAFhdAMECBAgQCACwhgMkwABAgQICKMbIECAAAECERDGYJgECBAgQEAY3QABAgQIEIiAMAbDJECAAAECwugGCBAgQIBABIQxGCYBAgQIEBBGN0CAAAECBCIgjMEwCRAgQICAMLoBAgQIECAQAWEMhkmAAAECBITRDRAgQIAAgQgIYzBMAgQIECAgjG6AAAECBAhEQBiDYRIgQIAAAWF0AwQIECBAIALCGAyTAAECBAgIoxsgQIAAAQIREMZgmAQIECBAQBjdAAECBAgQiIAwBsMkQIAAAQLC6AYIECBAgEAEhDEYJgECBAgQEEY3QIAAAQIEIiCMwTAJECBAgIAwugECBAgQIBABYQyGSYAAAQIEhNENECBAgACBCAhjMEwCBAgQICCMboAAAQIECERAGINhEiBAgAABYXQDBAgQIEAgAsIYDJMAAQIECAijGyBAgAABAhEQxmCYBAgQIEBAGN0AAQIECBCIgDAGwyRAgAABAsLoBggQIECAQASEMRgmAQIECBDYMN5iIECAAAECBO4FbjeMNzAIECBAgACBe4GbDeMVDAIECBAgQOBe4GrDeDHvBxACBAgQIHDgAtvCiw3j9bzzA8fw5RMgQIAAgW3h9fMHhy/z45t5Lx9+7gcCBAgQIHBIAl/ni/133t2vMN7NTy7nvZj357zjeT4ECBAgQOCpC+wfn+7vFDeK3/aL/V0Az+bX3897O+903sk8HwIECBAg8FQE9tsU9zsy9h+f7r+z2b9SfPz8BKphK/rB7BocAAAAAElFTkSuQmCC"},{"name":"image/invitationGiftFrame.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.miniapp_01/image/invitationGiftFrame.png"},{"name":"image/lineBg.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbMAAAAGCAYAAAE+mkBjAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAABs6ADAAQAAAABAAAABgAAAADQ2iWdAAAAeUlEQVRoBe3WwQ3AIAwDQOgY3X/Q8ugMkbCvUt/gMxHstdZ7/shvn1SR4WKDRR7DP5TSLmz3uXDP9Vs2afVHAMCEgEGbULZGtYAnSHX9wk8IGLIJZWtUC3guVtcvPAECBDIEvBgzepSCAAEC1QIus+r6hSdAgECGwAeL7ADIr6AfGgAAAABJRU5ErkJggg=="},{"name":"image/link.png","url":"data:image/png;base64,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"},{"name":"image/more.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAQRJREFUWAntkjFrAkEQhc8oSReIQiqFFOkCBtKKQtQf4i+0tIyENClCIAHbiCJ22lkEo+Z7hwdzw7ViMw8+bt9wuzO83SQJRQKRQCQQCUQCZ06g5PpX8F1owgE+4RX24HVPoQ9VmMMI1mBVxnTgCdTrG17gD1LpB6sepgWXcAV3sIMZWN1iBnANOkNDaCANbIdt459BZ+nMBuj/H0h1kS2O30fnZZsFtQdqOsiqhqnbAuuivbkefgC3//TWD/BV0FL35jWhoKuxWmEWtsC6aG+uh49Rj6kCN/AL7/AGepBWG8wS9BZ0t1MYgupW2UC6ni18wBjsO8GGIoFIIBKIBCKBMybwD0n5JheO9KwsAAAAAElFTkSuQmCC"},{"name":"image/next.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/UlEQVQ4T42TIW8CQRCFv/dj+jNI0PVNgQSHgqCamhpagasEhasiGBSYVlVVVdUQEMUURUJS1Zohk+w11+W425dsssnufJm381bkZGZ1wNeDJMufndsrAtwDA2AONCX9VEH+Afyymc2AK2ARIN9lkBNABHkOkH2ShchO1skr0JC0K4IUdpBdzNl5C5BtDCkFRHbeA2Sdh1QCIsgHUJN0yCCpgGtgGoouJG2SAWbWBp6A32DBM/KnqkfsABPAs+CTWCY/opn1gBHgGfDil+QxmtkN8Ah8hSB5FgpVFOU7YAh8hmLPwFnFn6kLjIEV0JLksy9VDLgEboG+JJ95pY46nl0RVPW7PwAAAABJRU5ErkJgghoWDAyC3AwMJ3YWJBYlgoWYgZgpLY2B4dNyBgbeSAYG4QtAPdHFacZGYHlGHicGBtZ7//9/VmNgYJ/MwPB3wv//vxf9//93MVDzHQaGA3kAFSFl7jXH0fsAAAA4ZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAKgAgAEAAAAAQAAACCgAwAEAAAAAQAAACAAAAAAj05AyQAAAx9JREFUWAntV01oE0EUntnZttqWeii1iF68WEW8iCCIF2lrmyZ68ecUEjbUbjx6FD2qR69mK2yaUjyUXrTNoogiKAhaBP9AFIr4g8GfQrWKFMn4nulbN7uzybYVEewc+t68+d43b2fevLwyFjYKhRsbw9ai2HP2lAzgqoxVEy/Umpxu9s6VOnpb9tWdykU0htKHekResOziaxVYc40dnV1195dScj/oNwNQcc4l59opAD12mb2KlS+O5vLFd16bThPLnroNelvWiG8g29+RXLUNfaneqrcPHu2fVWHIpiTARWt6ukE+Ki2grgneNZSOP0fdP0IJvECKSHCx75gRu+Vdq7oH7wLpkALnUeeMz/md0e5eA068I2cXJxmTCcnkTDaTiBSp648hL96ra/uflIsjTgoOsBD1mwPXWJbyIJx+Cl7OvSgkyuuBG7gOta2Hc/bMNBLbahEFIkCwmUn0gpiQkm0NqyVEqiTARUieI1AhLEikTbn81Edy8MtQAgSaRjzLmXaWSdYOyfXF74zzmgQIMDMDp1HCaK2I6r91CeglMiH2VLtWZspbwKXxcSlm54s/UNf1hh2Dqb4nqPuHksBxnKZXpfJ3BDdxsdkwYi/9jjQPEIyNOW3zC+U5BDTrDZ2pVN97AqtkoB58XZBPEdjaqK1LJvs+q5xWbf/WCQSyQBUePmh8k7gGDndaGrV4MjnwRy647kvCTVsa+XbcGHUoU3sxTaHePRwdvbYebSsZkU6ANqg8MDmBP3dkAzkDj6271mPzYAPqkgIg70qZcGys/GSD7qqkC703rGS4OJ+yrAC8HNg5QH6cIBt2EFJosWw6dpdsteSKAyDyYbt4sszkOZpDtr7IGokt7jxEiZSEIb6u2bKdM1WbMzYvmBhyATWUZZ8AdtzDI84FkKbLz9knLvX9Zqb/gWuroyw5gMW+9RLwHiZuuPc3XLDusB6WcCoZOYBf/0p9KF3GdoWIsG1Zo63tSae735JtqTJSAFB0oMWRh4gcupX7okX012v/CV9LBn5PVWCN8ytlyXbD19/kHZ3HzQO7vqlwq7blnMBPR/8IbV7RR0wAAAAASUVORK5CYII="},{"name":"image/notificationIcon.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkIyNjYxNkIwM0UyRTExRTk5QTc5OTc0OTYwRjIwNjIwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkIyNjYxNkIxM0UyRTExRTk5QTc5OTc0OTYwRjIwNjIwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzkyNkY0N0YzRDY4MTFFOTlBNzk5NzQ5NjBGMjA2MjAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzkyNkY0ODAzRDY4MTFFOTlBNzk5NzQ5NjBGMjA2MjAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5aG2RSAAAHAElEQVR42uxcS5Lj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"},{"name":"image/notificationRighDis.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAeCAQAAACLBYanAAAAaElEQVR42mMgGhwvO/7q+BQCioBK/gPhmuN8+BRNASoBwaODUFkZVNmd44r0UxYFVfaKWGW2+JV9JUaZLVTZV+KU3aFAEaZ1hJUQ9hvhUCI/vBExRzMlmOmShkoQmZNwBvh6fA0DZQAAkBfvfY7t14YAAAAASUVORK5CYII="},{"name":"image/preview.png","url":"https://ark-release-1251316161.file.myqcloud.com/com.tencent.miniapp_01/image/preview.png"},{"name":"image/wxMiniappIcon.png","url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAALaADAAQAAAABAAAALQAAAABGqAVQAAAE7ElEQVRYCe2YXWwUVRTHz5lpd+kHAYIQSlQgWqpGEms/qA+aGIONH9FGEk0ICcb4gTE2FnW30i4P/ZDuLpTYAIqJ8qA+2BclDSEh+mTUlpaqICo2AqGEWhFtS+zS3Zk5ntt0wvTemXbb3W2N6bzM3P+595zfnPs5A7BwLWTg/5UBnKvXaW8/4+s7N/qQBdYmAlgLCDcBwZ8IdBE0/CIva/WXO3bcEkuGJ+PQbW19/pHRv15h0J0EtNwLikH+RtAiub6Cd6aDzyh0S0vPrQk0jxDRPV6wso6IPwLqVaFA6W+yzS5nDLppT+8ay0x0AtEqO1iydwS8CprvvlCguM+tjeYmpqq1tvbnkBHvmAoYEUyvOOPDiMaOhsO/LHarkxHoUeNyDY/hDXJAzuAAd//zWdlYVLRuox81/3oN8VnW+uW6RFA4RsO1si7KaR8ehw715P4xZPzOQSdliYGP5/t9z9TUFA/JICKjcRj6mNs84bRxb8Tyff7Vcpu0Z/rKiFmpAsOgnpu9VQ5uAwaDd1xjuG2AeMnWxJ395FwzEo87NfGcdmgy4UE5CMPs21l97xVFdwjihRgm7JDGHzWTFH/phwa4WQ6sI3wjax7lTlnnuaH4Szv0+E4nRSZf7q+S5FrMhuzLLoZFspZ+aCDFpy9hccKmv+KauV6phaCs1UoApdFcCpb1nBwOCZRe+s9AN0a6H+X1YosMbYF+TNbmHZrPJdgU7toOZLXzEqdPBsSju2pLT0/WALJkYS7L0egPeY2RE2K7V5Y1sc3zsbXJjWdGmeZT2xI3J7PVxszYy27A4/5Ie7U+WKEsgcKWVKYbI50P84F9f5yMwoaWrp8QtadCwbKzs4W121kargD3haUpVFv+rl1Pvk8JLbrvuhl7jyzYeqMh3QVk7ufyphva7J6QtA8BzBd4PVwmPPDB6TwgbQ8FKo5P5dFzeLS3kx4zr3/KDh3AE64Q1kzlNFmb6K0sv17KPfcGf7W8uHKpfvd0wMK3Z6bPXjhxgJegx9wBtI/c9Zmrb9WUneNWe2fS0hW6YU9nCRn0kuyIj5fDpFEgFCh/X7bNZdkVGk0M8teDzHHBh3R/MFBxSTbMdVkZ02+39a7gRX7zZBC0dD37yWBw/oEFlwJtxY07eSzLekfdmyWnJr/I/JVkOCADimQc3p2+lrX5LCvQvHWOr5lOKP6QTOrPj2jDk1X5ZeD35w47/aX6rEDz4j6gOCUqUTQXYffBU8v4AHSb08QvcbW6unDMqaX6rEAjZp2RnRJgZTLnDmMk9rTclsuKP5c6M5IU6LpAaS938kWnF17+ChJgiK3b82qMdq3jXorKFRDpM1lLtaxAC4c88Q7KjsV23hjuPNK8r6dAtjVFujeDSd/Kvw7Y04iW4/tErp9qmeeYeh0+fH5R/+Dgz2xZq1pxlGfbSf4M+l58xDIoj3dSv+24oQYYrK/dGFF9pKa4QguXDXu7i9GwvuKJlTe7ENgRCpZX8cnNml1771auw0NU3/V62XegaVU8VpTfWN7uJiwIx5Yvzt+SCWARwTPTNtju1pO3G3HjA56MD9ia150h/2GX4fpAWXOmgEXsaaFtwOaWrkoLYRtPyEf4E2mprU84Oc2ePtf8eQfqXtsw6LRl4jlpaDs4j3EtGu1emQBYhTqN6saSAfED0bYv3BcysJCBmWfgX0a4irFl8bKHAAAAAElFTkSuQmCC"}],
        fonts: {"size.12":{"fontFamily":" PingFangSC-Regular,Helvetica,sans-serif,Microsoft YaHei","size":12,"bold":false},"bold.12":{"fontFamily":" PingFangSC-Regular,Helvetica,sans-serif,Microsoft YaHei","size":12,"bold":true},"size.14":{"fontFamily":"PingFangSC-Regular,Helvetica,sans-serif,Microsoft YaHei","size":14,"bold":false},"size.17":{"fontFamily":" PingFangSC-Semibold,Helvetica,sans-serif,Microsoft YaHei","size":17,"bold":false},"app.default":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":12,"bold":false},"app.bold":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":12,"bold":true},"bold.14":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":14,"bold":true},"bold.17":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":17,"bold":true},"size.20":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":20,"bold":false},"size.25":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":25,"bold":false},"size.30":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":30,"bold":false},"size.40":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":40,"bold":false},"size.50":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":50,"bold":false},"bold.60":{"fontFamily":"Helvetica,sans-serif,Microsoft YaHei","size":60,"bold":true}},
        appVersion: "1.0.1.41",
        buildVersion: "20230223224235",
        styles: {"origin-wrap":{"display":"flex","flexDirection":"row","alignItems":"center","height":"34pt"},"origin-wrap__hd":{"display":"block","width":"15pt","height":"15pt","marginLeft":"15pt"},"origin-wrap__icon":{"display":"block","width":"100%","height":"100%"},"origin-wrap__bd":{"display":"block","flex":1,"marginLeft":"0.666vw"}},
        applicationEvents: [{"eventName":"OnCreateView","callback":"app.OnCreateView"},{"eventName":"OnDestroyView","callback":"app.OnDestroyView"},{"eventName":"OnStartup","callback":"app.OnStartup"},{"eventName":"OnConfigChange","callback":"app.OnConfigChange"}],
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

    function createApp(options) {
      const templates = ArkGlobalContext.getViewTemplates();
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
