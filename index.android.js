import React, { Component } from 'react';
import Markdown from 'react-native-simple-markdown';
import {
  StyleSheet,
  Text,
  View,
  Image,
  PanResponder,
  Dimensions,
  ToastAndroid,
  TextInput,
  ScrollView
} from 'react-native';
const { width, height } = Dimensions.get('window')
var TWEEN = require('tween.js');
requestAnimationFrame(animate);
function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
}


class UselessTextInput extends Component {
  render() {
    return (
      <TextInput
        {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
        editable = {true}
        maxLength = {40}
        style={styles.card}
      />
    );
  }
}

export class App extends Component {
  componentWillMount() {
    const me=this;
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const dx=Math.abs(gestureState.dx);
        // console.log('onMoveShouldSetPanResponder',dx);
        if(dx>20){
          me.accept("panStart",dx);
        }

        return dx>20;//发生大于20的水平偏移时才作为响应者
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

      onPanResponderGrant: (evt, gestureState) => {
        // The guesture has started. Show visual feedback so the user knows
        // what is happening!

        // gestureState.{x,y}0 will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        const dx=gestureState.dx;
        console.log('onPanResponderMove',dx);
        me.accept("contX",dx);
        // ToastAndroid.show('dx '+dx, ToastAndroid.SHORT);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        const dx=gestureState.dx;
        me.accept("panEnd",dx);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  constructor(props){
    super(props);
    this.state={contX:-width,leftX:0,middleX:width,rightX:2*width,
      llist:0,mlist:1,rlist:2,
      mlist_y:0,rlist_y:0}
    this.accept=this.accept.bind(this);
  }

  render() {
    console.log(styles)
    const {contX,leftX,middleX,rightX,llist,mlist,rlist,mlist_y,rlist_y}=this.state;
    return (
      <View style={[containerStyle,{left:contX}]}>
        <View style={[styles.leftlist,{left:leftX}]} >
          <View style={styles.card} >
            <Text style={styles.text}>{llist}</Text>
          </View>
          <View style={styles.card} >
            <Text style={styles.text}>{llist}</Text>
          </View>
          <View style={styles.card} >
            <Text style={styles.text}>{llist}</Text>
          </View>
        </View>
        <ScrollView  ref={(scrollView) => { this._scrollView = scrollView; }}
         style={[styles.middlelist,{left:middleX,top:mlist_y}]}
        onScroll={event=>this.accept("recordScrollY",event.nativeEvent.contentOffset.y)} >
          <View style={styles.card}  >
            <Text style={styles.text}>{mlist}</Text>
          </View>
          <View style={styles.card}  onLayout={e=>this.accept("measureCard",{cardID:2,layout:e.nativeEvent.layout})} {...this._panResponder.panHandlers}>
            <Text style={styles.text}>{mlist}</Text>
          </View>
          <View style={styles.card}  >
            <Text style={styles.text}>{mlist}</Text>
          </View>
        </ScrollView>
        <View style={[styles.rightlist,{left:rightX,top:rlist_y}]} >
          <View style={styles.card}>
            <Text style={styles.text}>{rlist}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.text}>{rlist}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.text}>{rlist}</Text>
          </View>
        </View>
      </View>
    );
  }


  accept(msg,data){
    var state=this.state||{}; //获取当前的state值
    const fns={
      "contX":setContainerX, //响应msg的函数列表
      "panEnd":panEnd,
      "panStart":panStart,
      "measureCard":measureCard,
      "recordScrollY":recordScrollY //记录滚动位置
    }
    if(fns[msg]){ //如果有响应函数，用响应函数处理state后刷新组件
      state=fns[msg](state,data,msg,this);
      if(state){
        this.setState(state);
      }
    }
  }
}
function recordScrollY(state,scrollY,msg,me) {
  me.scrollY=scrollY;
}
function measureCard(state,layout,msg,me) {
  const cardID=layout.cardID;
  const {x, y, width, height}=layout.layout;
  me.layouts=me.layouts||{};
  me.layouts[cardID]=layout.layout;
  return null;
}

function setContainerX(state,dx,msg) {
  state.contX=-width+dx;
  return state;
}

function panStart(state,dx,msg,me) {
  me.panStartTime=Date.now();//开始移动时间
  const layout=me.layouts[2];//取得2号卡片的位置，假设2号卡片是拖动的卡片
  const scrollY=me.scrollY||0;
  const posY=layout.y-scrollY;//减去滚动的相对位置，得到相对于屏幕的距离
  state.rlist_y=Math.max(posY,0);
  // state.rlist_y=layout.y;
}

function panEnd(state,dx,msg,me) {
  console.log("panEnd");
  if(Math.abs(dx)<20){ //不移动
      state.contX=-width;
      me.setState(state);
  }else{
      const panEndTime=Date.now();
      const v=(width-Math.abs(dx))/(panEndTime-me.panStartTime);
      if(dx<-20){//左移
          state.contX=dx;
          state.llist=state.mlist;
          state.mlist=state.rlist;
          state.mlist_y=state.rlist_y;//拷贝右侧位置
          state.rlist_y=0;//恢复
          state.rlist=state.mlist+1;
          me._scrollView.scrollTo({x: 0, y: 0, animated: false});
          tweenH(me,state,v).chain(tweenUp(me,state)).start(); //左移后还需上移
      }else{//右移
          state.contX=-2*width+dx;
          state.rlist=state.mlist;
          state.mlist=state.llist;
          state.llist=state.mlist-1;
          tweenH(me,state,v).start();  
      }
  }
  return null;
}


//横向移动动画
const tweenH = (me,state,v)=>new TWEEN.Tween(state).easing(TWEEN.Easing.Quadratic.In)
      .to({ contX: -width}, Math.abs(state.contX-(-width))/v)
      .onUpdate(function() {
          me.setState(state);
      });

const tweenUp=(me,state)=>new TWEEN.Tween(state)
      .to({ mlist_y: 0}, 300)
      .onUpdate(function() {
          me.setState(state);
      });

var containerStyle={
    position:"relative",
    backgroundColor: '#F5FCFF',
    height:height,
    width:width*3
  };
const styles = StyleSheet.create({
  leftlist:{
    position:"absolute",
    // backgroundColor: 'lightpink',
    width:width,
    height:height,
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  middlelist:{
    position:"absolute",
    // backgroundColor: 'lightgreen',
    width:width,
    height:height,
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  rightlist:{
    position:"absolute",
    // backgroundColor: 'lightblue',
    width:width,
    height:height,
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  card:{
    width:width,
    height:height*2/3,
    borderWidth: 2,
    borderColor: 'gray',
    borderStyle:'dashed',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  } ,
  text:{
    fontSize:72
  }
});
import {AppRegistry } from 'react-native';
AppRegistry.registerComponent('AwesomeProject', () => App);

