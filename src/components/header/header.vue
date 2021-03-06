<template>
  <div class="header">
    <div class="content-wrapper">
      <div class="avatar">
        <img width="64" height="64" v-bind:src="seller.avatar">
      </div>
      <div class="content">
        <div class="title">
          <span class="brand"></span>
          <span class="name">{{seller.name}}</span>
        </div>
        <div class="description">
          {{seller.description}}/{{seller.deliveryTime}}分钟送达
        </div>
        <div v-if="seller.supports" class="support">
          <span class="icon" v-bind:class="classMap[seller.supports[0].type]"></span>
          <span class="text">{{seller.supports[0].description}}</span>
        </div>
      </div>
      <div v-if="seller.supports" v-on:click="showDetail" class="support-count" >
        <span class="count">{{seller.supports.length}}个</span>
        <i class="icon-keyboard_arrow_right"></i>
      </div>
    </div>
    <div class="bulletin-wrapper" v-on:click="showDetail">
      <span class="bulletin-title"></span><span class="bulletin-text">{{seller.bulletin}}</span>
      <i class="icon-keyboard_arrow_right"></i>
    </div>
    <div class="background">
      <img v-bind:src="seller.avatar" width="100%" height="100%">
    </div>
    <transition name="fade">
      <div v-show="detailShow" class="detail">
      <div class="detail-wrapper clearfix">
        <div class="detail-main">
          <h1 class="name">{{seller.name}}</h1>
          <div class="star-wrapper">
            <star v-bind:size="48" v-bind:score="seller.score"></star>
          </div>
          <div class="title">
            <div class="line"></div>
            <div class="text">优惠信息</div>
            <div class="line"></div>
          </div>
          <ul v-if="seller.supports" class="supports">
            <li class="support-item" v-for="(item,index) in seller.supports">
              <span class="icon" v-bind:class="classMap[index]">
              </span>
              <span class="text">{{item.description}}</span>
            </li>
          </ul>
          <div class="title">
            <div class="line"></div>
            <div class="text">商家公告</div>
            <div class="line"></div>
          </div>
          <div class="bulletin">
            <p class="content">{{seller.bulletin}}</p>
          </div>
        </div>
      </div>
      <div class="detail-close" v-on:click="hideDetail">
        <i class="icon-close"></i>
      </div>
    </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import star from 'components/star/star';

  export default {
    props: {
      seller: {
        type: Object
        // 注意不要写成object
      }
    },
    methods: {
      showDetail() {
        this.detailShow = true;
      },
      hideDetail() {
        this.detailShow = false;
      }
    },
    data() {
      return {
        detailShow: false
      };
    },
    created() {
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
    },
    // star 作为header组件的子组件，通过components被注册
    components: {
      star
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  // ../表示上一级目录 ./表示当前目录
  @import "../../common/stylus/mixin.styl"

  .header
    position relative
    color: #fff
    overflow hidden
    background rgba(7,17,27,0.5)
    .content-wrapper
      position relative
      font-size 0
      padding:24px 12px 18px 24px
      // 此处注意padding和margin的区别，padding设置的是包含的子元素avatar以及content的位置
      .avatar
        display inline-block
        vertical-align top
        //同title中的brand，name都是top，保证了上端对齐
        img
          border-radius 2px
      .content
        display inline-block
        margin-left 16px
        font-size 14px
        .title
          margin:2px 0 8px 0px
          .brand
            display inline-block
            vertical-align top
            width 30px
            height 16px
            bg-image('brand')
            // 直接引用mixin.styl文件中的函数
            background-size 30px 18px
            background-repeat no
          .name
            // 字体颜色继承父元素的白色，其余数据根据实际测量数据获得
            margin-left 6px
            font-size 16px
            line-height 18px
            font-weight bold
        .description
          margin-bottom 10px
          line-height 12px
        .support
          .icon
            display inline-block
            vertical-align bottom
            width 12px
            height:12px
            margin-right 4px
            background-size 12px 12px
            background-repeat no-repeat
            //要用不同的样式引用不同的图片,不过这里&.decrease表示父样式的子样式
            &.decrease
              bg-image('decrease_1')
            &.discount
              bg-image('discount_1')
            &.guarantee
              bg-image('guarantee_1')
            &.invoice
              bg-image('invoice_1')
            &.special
              bg-image('special_1')
          .text
            line-height 12px
            font-size 10px

      .support-count
        position absolute
        right 12px
        bottom 16px
        padding 0 8px
        height 24px
        line-height 24px
        border-radius 14px
        background rgba(0,0,0,0.2)
        text-align center
        .count
          font-size 10px
        .icon-keyboard_arrow_right
          margin-left 2px
          line-height 24px
          font-size 10px

    .bulletin-wrapper
      position relative
      height 28px
      line-height 28px
      padding 0 22px 0 12px
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
      background rgba(7,17,27,0.2)
      .bulletin-title
        display inline-block
        vertical-align top
        margin-top 8px
        width 22px
        height 12px
        bg-image('bulletin')
        background-size 22px 12px
        background-repeat no-repeat
      .bulletin-text
        vertical-align top
        margin 0 4px
        font-size 10px
      .icon-keyboard_arrow_right
        position absolute
        font-size 10px
        right 12px
        top 8px

    .background
      position absolute
      top 0px
      left 0px
      width 100%
      height 100%
      z-index -1
      filter blur(10px)

    .detail
      position: fixed;
      z-index 100
      //不设置top left的话，会空下上面的部分
      top 0
      left 0
      width 100%
      height 100%
      //因为高度大于屏幕高，所以需要设置为 auto
      overflow auto
      //背景色是半透明的
      background rgba(7,17,27,0.8)
      backdrop-filter:blur(10px)
      &.fade-enter, &.fade-leave-to
        opacity 0
      &.fade-enter-active,&.fade-leave-active
        transition all .5s ease
      .detail-wrapper
        width 100%
        //最小高度跟视口一样高，整体高度跟内容相关
        min-height:100%
        .detail-main
          margin-top 64px
          padding-bottom 64px
          //给下面的close留下空间,只是这里好像用margin也可以，？？？
          .name
            line-height 16px
            font-weight 700
            font-size 16px
            text-align center
            //这里text-align一开始没有效果的原因是，父元素的宽度是由这个元素撑满的，所以需要设置父元素 width：100%
          .star-wrapper
            margin-top 18px
            padding 2px 0px
            text-align center
          .title
            display flex
            width 80%
            margin 28px auto 24px auto
            .line
              flex: 1
              position relative
              //这里用-6表示向下移动6px，用border做线条
              top -6px
              border-bottom 1px solid rgba(255,255,255,0.2)
            .text
              padding 0 12px
              font-weight 700
              font-size 14px
          .supports
            width 80%
            margin 0 auto
            .support-item
              padding:0 12px
              margin-bottom 12px
              font-size 0
              &:last-child
                margin-bottom 0
              .icon
                display inline-block
                width 16px
                height: 16px
                vertical-align top
                margin-right 6px
                background-size 16px 16px
                background-repeat no-repeat
                &.decrease
                  bg-image('decrease_2')
                &.discount
                  bg-image('discount_2')
                &.guarantee
                  bg-image('guarantee_2')
                &.invoice
                  bg-image('invoice_2')
                &.special
                  bg-image('special_2')
              .text
                line-height 16px
                font-size 12px
          .bulletin
            width 80%
            margin 0 auto
            .content
              padding: 0 12px
              line-height 24px
              font-size 12px
      .detail-close
        position relative
        width 32px
        height 32px
        margin:-64px auto 0 auto
        //因为close在wrapper下面，所以需要设置-64，不然就跑到了视口外面
        clear both
        font-size 32px

</style>
