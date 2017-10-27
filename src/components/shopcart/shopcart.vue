<template>
  <div>
    <div class="shopcart">
      <div class="content" v-on:click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" v-bind:class="{'highlight':totalCount>0}">
              <i class="icon-shopping_cart" v-bind:class="{'highlight':totalCount>0}"></i>
            </div>
            <div class="num" v-show="totalCount>0">{{totalCount}}</div>
          </div>
          <div class="price" v-bind:class="{'highlight':totalPrice>0}">¥{{totalPrice}}</div>
          <div class="desc">另需配送费{{deliveryPrice}}元</div>
        </div>
        <div class="content-right">
          <div class="pay" v-bind:class="payClass">
            {{payDesc}}
          </div>
        </div>
      </div>
      <div class="ball-container">
        <div v-for="ball in balls">
        <!--用了两种动画，css动画和vue钩子动画，外层动画负责小球的轨道和方向-->
          <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
            <div v-show="ball.show" class="ball">
              <!--内层动画，负责动画小球的运行状态-->
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>

      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <!--ref是用来给 better-scroll绑定的dom-->
          <div class="list-content" ref="listContent">
            <ul>
              <!--通过遍历selectFoods获得被勾选的所有数据-->
              <li class="food" v-for="(food,index) in selectFoods">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>¥{{food.price*food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <!--引入购物车详情列表里面的购物车按钮组件 cartconrol-->
                  <cartcontrol v-bind:food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <!--购物车详情页的遮罩以及动画处理，遮罩的层级和购物车一层，同级，只是在后面-->
    <transition name="fade">
      <div class="list-mask" @click="hideList" v-show="listShow"></div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';
  import cartcontrol from 'components/cartcontrol/cartcontrol';

  export default {
    // 通过props,建立对象，传入相关数据，即selectFoods。购物车是选择商品的映射，如果type为array或者object的话，default是函数.
    props: {
      selectFoods: { // 被勾选的所有goods的数据
        type: Array,
        default() {
          return [
            {
              price: 10,
              count: 1
            }
          ];
        }
      },
      // 因为html不区分大小写，所以这里实际上是把deliveryPrice==delivery-price，在props中很常见
      deliveryPrice: {
        type: Number,
        // 默认值
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    // 这里面的所有计算都是通过selectFoods而来的
    // 因为要创建若干个小球，所以要建立一个data数组，每个都表现小球当前的状态
    data() {
      return {
        balls: [
          {show: false},
          {show: false},
          {show: false},
          {show: false},
          {show: false}
        ],
        // 这里用dropBalls来表示正在运行的小球
        dropBalls: [],
        // 这里用fold变量来控制，购物车详情页的展开或这折叠的情况
        fold: true
      };
    },
    computed: {
      totalPrice() {
        let total = 0;
        this.selectFoods.forEach((food) => {
          total += food.price * food.count;
        });
        return total;
      },
      totalCount() {
        let count = 0;
        this.selectFoods.forEach((food) => {
          count += food.count;
        });
        return count;
      },
      // 由三种情况，不够起送价，没有购买，够了起送价
      payDesc () {
        // 要用全等号 ===
        if (this.totalPrice === 0) {
          // es6 `反引号的作用 相当于 +
          return `¥${this.minPrice}元起送`;
        } else if (this.totalPrice < this.minPrice) {
          let diff = this.minPrice - this.totalPrice;
          return `还差¥${diff}元起送`;
        } else {
          return '去结算';
        }
      },
      // 这里只需要判断两种情况
      payClass () {
        if (this.totalPrice < this.minPrice) {
          return 'not-enough';
        } else {
          return 'enough';
        }
      },
      listShow() { // 购物车是否展示内部列表
        if (!this.totalCount) { // 判断有没有数量的情况
          // 当总数不存在，即没有选任何商品时，fold为true，返回 false，即fold的display=none，是折叠状态不显示
          this.fold = true;
          return false;
        }
        // 此时show 为 false
        let show = !this.fold;
        // 因为只有列表展示的时候，才需要启动滚动效果，所以在此处做初始化
        if (show) { //  展示购物车的内容
          this.$nextTick(() => { // 异步处理，防止卡顿
            if (!this.scroll) { // 如果没有this.scroll的时候再实例化
              // 用¥refs绑定vue的dom元素
              this.scroll = new BScroll(this.$refs.listContent, {
                click: true // 让betterscroll把click事件也传递出去
              });
            } else { // 使用bettercsroll内置事件refresh 直接更新绑定，不用重新实例化一次betterscroll
              this.scroll.refresh();
            }
          });
        }
        return show;
      }
    },
    methods: {
      drop(el) {
        // 触发一次事件就会把所有小球进行遍历
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.ball[i];
          if (!ball.show) {
            ball.show = true;
            ball.el = el; // 设置小球的el属性为同一个dom对象
            this.dropBalls.push(ball);
            return;
          }
        }
      },
      beforeDrop(el) {
        let count = this.ball.length;
        while (count--) {
          let ball = this.balls[count];
          if (ball.show) {
            let rect = ball.el.getBoundingClientRect(); // 获取小球相对于视口的位移
            let x = rect.left - 32;
            let y = -(window.innerHeight - rect.top - 22); // 负数，是因为是从左上角往下的方向
            el.style.display = ''; // 清空display
            el.style.webkitTransform = `translate3d(0,${y}px,0)`;
            el.style.transform = `translate3d(0,${y},0)`;
            // 处理内层动画
            let inner = el.getElementsByClassName('inner-hook')[0]; // 使用innerhook来操作
            inner.style.webkitTransform = `translate3d(0,${x}px,0)`;
            inner.style.transform = `translate3d(0,${x},0)`;
          }
        }
      },
      dropping(el, done) {
        /* eslint-disable no-unused-vars */
        let rf = el.offsetHeight;
        this.$nextTick(() => {
          el.style.webkitTransform = 'translate3d(0,0,0)';
          el.style.Transform = 'translate3d(0,0,0)';
          // 处理内层动画
          let inner = el.getElementsByClassName('inner-hook')[0]; // 使用innerhook来操作
          inner.style.webkitTransform = `translate3d(0,0,0)`;
          inner.style.transform = `translate3d(0,0,0)`;
          el.addEventListener('transitionend', done); // vue为了知道过渡的完成，必须设置相应的事件监听
        });
      },
      afterDrop(el) {
        let ball = this.dropBalls.shift();
        if (ball) {
          ball.show = false;
          el.style.display = 'none';
        }
      },
      toggleList() {
        // 即如果购物车里没有商品的时候，即！this.totalCount为真，则函数结束，如果为假，则this.fold = !this.fold; 即取反
        if (!this.totalCount) {
          return;
        }
        this.fold = !this.fold;
      },
      empty() {
        this.selectFoods.forEach((food) => {
          food.count = 0;
        });
      },
      hideList() {
        this.fold = true;
      }
    },
    components: {
      cartcontrol // 注册cartcontrol组件，便于当前vue文件使用
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"

  .shopcart
    position fixed
    left 0
    bottom 0
    z-index 50
    // 这里要设置z-index的原因是，有一个小半圆要盖住后面的区块
    width 100%
    height 48px
    .content
      display flex
      background #141D27
      color rgba(255,255,255,0.4)
      .content-left
        flex 1
        font-size 0
        // 因为三个为横向排列，所以应该用inline-block布局,同时为了消除间隙，在父元素的fontsize设为0
        .logo-wrapper
          // 利用position 的负值来定位超出父元素的部分
          display inline-block
          vertical-align top
          position: relative
          top -10px
          margin 0 12px 2px 12px
          padding 6px
          width 56px
          height 56px
          // border和padding全会在设置的宽度内部，所有元素的内边距和边框不再会增加它的宽度
          box-sizing border-box
          // vertical-align用来设置垂直对齐方式，所有垂直对齐的元素都会影响行高
          border-radius 50px
          background #141D27
          .num
            position absolute
            // 因为是绝对定位，所以要明确宽高，这样才能被撑开
            top: 0
            right:0
            width 24px
            height: 16px
            // 保证垂直居中
            line-height 16px
            // 保证水平居中
            text-align center
            border-radius 16px
            font-size 9px
            font-weight 700
            color #fff
            background rgb(240,20,20)
            box-shadow 0 4px 8px 0 rgba(0,0,0,0.4)
        .logo
          width 100%
          height 100%
          border-radius 50%
          // 此处设计稿给的是黑色半透明，这是不对的，因为有底色。所以实际应该是灰色
          background #2b343c
          text-align center
          // 当logo高亮的时候
          &.highlight
            background rgb(0,160,220)
          .icon-shopping_cart
            font-size 24px
            line-height 44px
            color #80858a
            &.highlight
              color #fff
        .price
          display inline-block
          vertical-align top
          line-height 24px
          margin-top 12px
          padding-right 12px
          box-sizing border-box
          // 这里用border-right来表示小竖线。而且小竖线还要求，line-height为24px而不是充满
          border-right 1px solid rgba(255,255,255,0.1)
          font-size 16px
          font-weight 700
          &.highlight
            color #fff
        .desc
          display inline-block
          vertical-align top
          margin 12px 0 0 12px
          line-height 24px
          font-size 10px
      .content-right
        flex:0 0 105px
        width 105px
        background #2b333b
        .pay
          // 通过height和line-height达到垂直居中
          text-align center
          height: 48px
          line-height 48px
          font-size 12px
          font-weight 700
          &.not-enough
            background #2b333b
          &.enough
            background #00b43c
            color: #fff

    .ball-container
      // 小球动画脱离Html的布局相对于视口的动画，所以要用fixed
      position fixed
      left 32px
      bottom 22px
      z-index 200
      transition all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
      // 贝塞尔曲线基于css3实现
      .inner
        width 16px
        height 16px
        border-radius 50%
        background rgb(0,160,220)
        transition all 0.4s linear
    .shopcart-list
      position absolute
      // 相对于shopcart的定位 top=0
      top: 0
      left 0
      z-index -1// 为了避免遮挡footer的图标
      width 100%
      // 设置css方式的vue动画初始值，纵坐标-100%是指相反方向的当前元素的100%高度，即购物车从看不见的下方进"入"
      transform translate3d(0, -100%, 0)
      &.fold-enter-active, &.fold-leave-active { // shop-list的渐入渐出过程动画
        transition all .5s ease// 全部元素0.5秒过渡变化
      }

      &.fold-enter, &.fold-leave
        transform translate3d(0, 0, 0)// 即"出"
      .list-header
        height 40px
        line-height 40px
        padding 0 18px
        background #f3f5f7
        border-bottom 1px solid rgba(7,17,27,0.1)
        .title
          float left
          font-size 14px
          color rgb(7,17,27)
        .empty
          float right
          font-size 12px
          color rgb(0,160,220)

      .list-content
        padding 0 18px
        max-height 217px// 因为没有固定高度，所以只是有最大高度，并包括底下footer部分
        background #fff
        overflow hidden // 要隐藏超过最大高度的部分
        .food
          position relative
          padding 12px 0px
          box-sizing border-box
          border-1px(rgba(7,17,27,0.1))// 要处理1px边框问题，所以引入 mixin.styl
          .name
            line-height 24px
            font-size 14px
            color rgb(7,17,27)
          .price
            position absolute
            right 90px
            bottom 12px
            line-height 24px
            font-size 14px
            font-weight 700
            color rgb(240,20,20)
          .cartcontrol-wrapper
            position absolute
            right 0
            bottom 6px

  .list-mask
    // 相对于屏幕窗口定位
    position fixed
    top: 0
    left: 0
    width 100%
    height 100%
    z-index 40
    backdrop-filter blur(10px) // 遮罩的虚化效果
    opacity 1
    background rgba(7,17,27,0.6)
    &.fade-enter-active, &.fade-leave-active
      transition all .5s
    &.fade-enter, &.fade-leave
      opacity 0
      background rgba(7,17,27,0)

</style>
