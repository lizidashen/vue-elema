<template>
  <div class="cartcontrol">
    <transition name="decreaseMove">
      <div class="cart-decrease icon-remove_circle_outline" v-show="food.count>0" v-on:click="decreaseCart"></div>
    </transition>
    <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
    <div class="cart-add icon-add_circle" v-on:click="addCart"></div>
  </div>
</template>

<script type="text/ecmascript-6">
  // import Vue from 'vue';

  export default {
    // 即在调用 cartcontrol 组件的时候，要从父元素传入 food.count
    props: {
      food: {
        type: Object
      }
    },
    methods: {
      addCart(event) {
        // 同good.vue的内容，但同样的问题，这里并没有出现pc端第二次，反而毫无反应
        if (!event._constructed) {
          return;
        }
        console.log('click');
        // 首先判断当前的food.count是否存在,若存在，则加一，不存在，则设为1
        if (!this.food.count) {
          // vue在新增或者删除某个变化是，需要增加新的接口,通过Vue.set方法添加属性，这样变化就可以被观测到，进而dom
          // Vue.set(this.food, 'count', 1);
          // this.$set是全局 Vue.set 的别名。
          this.$set(this.food, 'count', 1);
        } else {
          this.food.count ++;
        }
        // drop事情的触发通过点击cartcontrol组件中的添加小球按钮addCart的同时派发事件cart.add，把event.target作为add事件的参数传入
        this.$emit('cart.add', event.target);
      },
      decreaseCart(event) {
        // 同good.vue的内容，但同样的问题，这里并没有出现pc端第二次，反而毫无反应
        if (!event._constructed) {
          return;
        }
          this.food.count --;
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  // 这里的➖ 和➕ 都可以用字体来表示
  .cartcontrol
    font-size 0
    // 按钮很小，为了ui设计美观，但是不利于点击，所以需要增大点击面积。可以通过padding增加
    // 外层字体设置大小为0以后，需要在内层重新设置字体大小。不然无法显示
    // 新版的动画设置变化较大，但也更为容易理解
    .decreaseMove-enter-active{
      transition all .5s ease
    }
    .decreaseMove-leave-active{
      transition all .5s ease
    }
    .decreaseMove-enter,.decreaseMove-leave-to{
      transform translateX(20px) rotate(180deg)
      opacity 0
    }
    .cart-decrease, .cart-add
      display inline-block
      padding 6px
      line-height 24px
      font-size 24px
      color: rgb(0,160,220)
      // 始终不显示，可能是字体大小没有设置的原因
    .cart-count
      display inline-block
      vertical-align top
      width 12px
      padding-top 6px
      line-height 24px
      // 水平居中
      text-align center
      font-size 10px
      color rgb(147,153,159)
    .cart-add
      display inline-block
</style>
