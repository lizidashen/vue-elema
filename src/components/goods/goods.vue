<template>
  <div>
    <div class="goods">
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li v-for="(item,index) in goods" class="menu-item" :class="{'current':currentIndex===index}"  @click="selectMenu(index,$event)">
          <span class="text border-1px">
            <span v-show="item.type>0" class="icon" v-bind:class="classMap[index]"></span>
            {{item.name}}
          </span>
        </li>
      </ul>
    </div>
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="(item,index) in goods" class="food-list food-list-hook">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li v-for="(food,index) in item.foods" class="food-item border-1px">
              <div class="icon">
                <img width="57" height="57" v-bind:src="food.icon">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span>
                  <span>好评率{{food.rating}}% </span>
                </div>
                <div class="price">
                  <span class="new">¥{{food.price}}</span>
                  <span class="old" v-show="food.oldPrice">¥{{food.oldPrice}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol v-bind:food="food"></cartcontrol>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <shopcart v-bind:select-foods="selectFoods" v-bind:delivery-price="seller.deliveryPrice" v-bind:min-price="seller.minPrice"></shopcart>
  </div>
    <!--<food v-on:add="addFood" v-bind:food="selectFoods" ref="food"></food>-->
  </div>
</template>

<script type="text/ecmascript-6">
  // 注意，在base文件中设置的时候，要用绝对路径/Users/lizidashen/sellnew/，不能用相对路径
  import BScroll from 'better-scroll';
  import shopcart from 'components/shopcart/shopcart';
  import cartcontrol from 'components/cartcontrol/cartcontrol';

  const ERR_OK = 0;

  export default {
    props: {
      seller: {
        type: Object
      }
    },
    data () {
      return {
        goods: [],
        // 需要变量来存储高度变化的值,是一个数组，因为需要知道每个数组的高度，是累加的过程
        listHeight: [],
        // 跟踪scrollY变量
        scrollY: 0
      };
    },
    created () {
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];

      this.$http.get('/api/goods').then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          this.goods = response.data;
          // vue更新dom的时候是异步的，所以改变数据的同时，dom并没有更新，所以需要用this.$nextTick保证dom已经渲染
          this.$nextTick(() => {
              this._initScroll();
              // 拿到数据以后再计算高度
              this._calculateHeight();
          });
        }
      });
    },
    computed: {
      // currentIndex表示左侧当前的索引位置，通过遍历刚才通过_calculateHeight()建立的listHeight，来获得左侧两个区间上下的高度范围
      // 当scrollY做变化的时候，currentIndex()也在实时计算
      currentIndex() {
        for (let i = 0; i < this.listHeight.length; i++) {
          let height1 = this.listHeight[i];
          let height2 = this.listHeight[i + 1];
          // 这个if判断说明了scrollY在某一个区间上，则范围此时的区间索引位置。同时排除最后到底部的可能，那时不存在height2
          if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
            return i;
          }
        }
      },
      // 通过两层遍历，取到了food的值，也就和cartcontrol的数据连动起来
      selectFoods() {
        let foods = [];
        this.goods.forEach((good) => {
          good.foods.forEach((food) => {
            if (food.count) {
              foods.push(food);
            }
          });
        });
        return foods;
      }
    },
    methods: {
      selectMenu(index, $event) {
        // 在html文件中，@click="selectMenu(index,$event)" 可以把index数据传递过来，同时可以通过$event访问当前事件
        // 方法:在点击时,传 $event变量,Better-scroll插件中的 event事件和原生 js的 event有属性上得区别,Better-scroll插件派发的事件时event_constructed为true,原生点击事件是没有这个属性的,
        // if语句里的return,使程序跳出if所在的函数,返回到母函数中继续执行。
        /* if (event._constructed) {
        } */
        // foodScroll  scrollToElement是一个方法 scrollToElement(el, time, offsetX, offsetY, easing)
        let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
        let el = foodList[index];
        this.foodScroll.scrollToElement(el, 300);
        console.log(index);
      },
      addFood(target) {
        this._drop(target);
      },
      _drop(target) {
        // 体验优化，异步执行下落动画
        this.$nextTick(() => {
          this.$refs.shopcart.drop(target);// 调用shopcart的下落动画
        });
      },
        // 获取数据以后调用一个方法_initScroll()
      _initScroll() {
        // BScroll接收两个对象，一个是dom对，通过ref获得，另一个是json对象。
        // better-scroll 默认会阻止浏览器的原生 click 事件。当设置为 true，better-scroll 会派发一个 click 事件，我们会给派发的 event 参数加一个私有属性 _constructed，值为 true。
        this.menuScroll = new BScroll(this.$refs.menuWrapper, {
          click: true,
          bounce: true
        });
        this.foodScroll = new BScroll(this.$refs.foodsWrapper, {
          // probeType 1：滚动的时候派发scroll事件，会截流。2：滚动的时候派发scroll事件，不会截流。3：除了实时派发scroll事件，在swipe的时候也可以实时派发scroll事件。即滑动事件。能实时检测到滚动的位置
          click: true,
          probeType: 3
        });
        //  监听 scroll 事件，事件的回调函数的参数就是位置。用刚才定义的scrollY来接收 pos.y,pos.y是纵坐标的意思。并且为负值
        this.foodScroll.on('scroll', (pos) => {
          // 把scroll转换成整数，及绝对值
          this.scrollY = Math.abs(Math.round(pos.y));
        });
      },
      _calculateHeight() {
        // 拿到每一个组块的高度，即包括图片和介绍的一个组块
        let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < foodList.length; i++) {
          let item = foodList[i];
          height += item.clientHeight;
          this.listHeight.push(height);
        }
      }
    },
    components: {
      shopcart,
      cartcontrol
    },
    event: {
      'cart.add'(target) {
        this.drop(target);
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"

  .goods
    display flex
    // 这里的goods部分绝对定位，只是其中的内容超出范围后需要滚动
    position absolute
    top: 174px
    // 即header的高度134px和tab的高度40px
    bottom 46px
    width 100%
    overflow hidden
    .menu-wrapper
      // flex 的三个属性，等分，内容不足的时候缩放和占位空间
      flex 0 0 80px
      // 需要写width，不然在安卓浏览器会出问题
      width 80px
      background-color  #f3f5f7
      font-size 0
      .menu-item
        // 垂直居中的布局用table
        display table
        padding 0 12px
        height 54px
        width 56px
        line-height 14px
        font-size 12px
        &.current
          position relative
          z-index 10
          font-weight 700
          margin-top -1px
          background #fff
          .text
            border-none()
        .icon
          display inline-block
          vertical-align top
          width 12px
          height:12px
          margin-right 0px
          background-size 12px 12px
          background-repeat no-repeat
          // 要用不同的样式引用不同的图片,不过这里&.decrease表示父样式的子样式
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
        .text
          display table-cell
          // 垂直居中
          vertical-align middle
          line-height 14px
          font-size 12px
          border-1px(rgba(7,17,27,0.1))
    .foods-wrapper
      flex 1
      .title
        padding-left 14px
        height 26px
        line-height 26px
        //左侧的小竖条用border写，这个技巧要记住
        border-left 2px solid #d9dde1
        font-size 12px
        color: rgb(147,153,159)
        background-color #f3f5f7
        //这里要⚠️，即便是与title的<h1>并列的元素是<ul>，可是<ul>本身没有class，所以其子元素也要与和<h1>并列
      .food-item
        //因为右侧的信息部分仍要做自适应，所以仍旧用flex布局
        display flex
        // 如果只是用margin，上下margin会坍缩，所以下面用padding
        margin 18px
        padding-bottom 18px
        //注意写border-1px时，要给相应的元素添加 class 属性，但其实也不需要也可以显示效果
        //border-1px(rgba(7,17,27,0.1))
        &:last-child
          //在mixin文件中建立相关函数，引用即可
          border-none()
          margin-bottom 0
        .icon
          //图片的宽高写到<img>中，width="64" height="64"
          flex:0 0 57px
          margin-right 10px
        .content
          //右侧文字部分要做自适应，所以用flex（1 1 auto）
          flex 1
          position relative
          .name
            margin 2px 0 8px 0px
            line-height 14px
            font-size 14px
            color rgb(7,17,27)
           //这样把相同的代码写在一起，可以减少代码量
          .desc,.extra
            line-height 12px
            font-size 10px
            color rgb(147,153,159)
          .desc
            margin-bottom 8px
          .extra
            //所以stylus不能直接跟class，需要&选择器
            &.count
              margin-right 12px
          .price
            //这里的难点在于同时有两种字体大小怎么办???
            font-size 0
            font-weight 700
            line-height 24px
            .new
              margin-right 8px
              font-size 14px
              color rgb(240,20,20)
            .old
              text-decoration line-through
              font-size 10px
              color rgb(147,153,159)

          .cartcontrol-wrapper
            // 不要忘了，这里设置绝对定位，就要在父元素设置相对定位
            position absolute
            right 0
            bottom 12px
</style>
