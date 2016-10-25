import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  PanResponder,
  Dimensions,
  ToastAndroid
} from 'react-native';
const { width, height } = Dimensions.get('window')
var TWEEN = require('tween.js');

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
      llist:0,mlist:1,rlist:2}
    this.accept=this.accept.bind(this);
  }

  render() {
    console.log(styles)
    const {contX,leftX,middleX,rightX,llist,mlist,rlist}=this.state;
    return (
      <View style={[containerStyle,{left:contX}]}>
        <View style={[styles.leftlist,{left:leftX}]} >
          <View style={styles.card}>
            <Text style={styles.text}>{llist}</Text>
          </View>
        </View>
        <View style={[styles.middlelist,{left:middleX}]} {...this._panResponder.panHandlers}>
          <View style={styles.card}  >
            <Text style={styles.text}>{mlist}</Text>
          </View>
        </View>
        <View style={[styles.rightlist,{left:rightX}]} >
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
      "panEnd":panEnd
    }
    if(fns[msg]){ //如果有响应函数，用响应函数处理state后刷新组件
      state=fns[msg](state,data,msg,this);
      if(state){
        this.setState(state);
      }
    }
  }
}

function setContainerX(state,dx,msg) {
  state.contX=-width+dx;
  return state;
}

function panEnd(state,dx,msg,me) {
  console.log("panEnd")
  if(dx<-20){
      state.contX=dx;
      state.llist=state.mlist;
      state.mlist=state.rlist;
      state.rlist=state.mlist+1;
      me.setState(state);
  }else if(dx>20){
      state.contX=-2*width+dx;
      state.rlist=state.mlist;
      state.mlist=state.llist;
      state.llist=state.mlist-1;
      me.setState(state);
  }else{
      state.contX=-width;
      me.setState(state);
  }
  return null;
}

var containerStyle={
    position:"relative",
    backgroundColor: '#F5FCFF',
    height:height,
    width:width*3
  };
const styles = StyleSheet.create({
  leftlist:{
    position:"absolute",
    backgroundColor: 'lightpink',
    width:width,
    height:height
  },
  middlelist:{
    position:"absolute",
    backgroundColor: 'lightgreen',
    width:width,
    height:height
  },
  rightlist:{
    position:"absolute",
    backgroundColor: 'lightblue',
    width:width,
    height:height
  },
  card:{
    width:width,
    height:height,
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

