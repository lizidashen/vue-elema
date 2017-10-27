<template>
  <div class="star" v-bind:class="starType">
    <span v-for="itemClass in itemClasses" v-bind:class="itemClass" class="star-item" track-by="$index"></span>
  </div>
</template>

<script type="text/ecmascript-6">
  // 定义常量，length 是指5颗星 剩下三个分别指三种状态
  const LENGTH = 5;
  const CLS_ON = 'on';
  const CLS_HALF = 'half';
  const CLS_OFF = 'off';

  export default {
    props: {
      size: {
        type: Number
      },
      // 这些是对外接口，用来获得相应的数据，size是星星的尺寸（数字 24 36 48），score 分数也是数字
      score: {
        type: Number
      }
    },
    computed: {
      // 所以starType就是通过'star-'加上不同的类型，组成不同的class
      starType() {
        return 'star-' + this.size;
      },
      //
      itemClasses() {
        // 创建数组变量
        let result = [];
        // 分数为先向下取整，除以2是获得 .5 的数据
        let score = Math.floor(this.score * 2) / 2;
        // 对1取余，看结果是不是0，如果不是，则此时结果是小数，即 .5
        let hasDecimal = score % 1 !== 0;
        // 对于整数部分，直接向下取整
        let integer = Math.floor(score);
        // 即对于整数部分，一个一个放全星
        for (let i = 0; i < integer; i++) {
          result.push(CLS_ON);
        }
        // 如果有小数，则放一个半星
        if (hasDecimal) {
          result.push(CLS_HALF);
        }
        // 当长度没有达到 length 时，就补充一个空星，做循环，直到result的长度等于 LENGTH 5
        while (result.length < LENGTH) {
          result.push(CLS_OFF);
        }
        // 返回这样一个一个加起来的result
        return result;
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"

  .star
    font-size 0
    //因为内容是inline-block排列的，所以这样设定可以消除空白字距
    .star-item
      //这是 star-item 通用样式，下面的是每个不同大小的class的特殊样式，每个<span>的样式由这两部分组成
      display inline-block
      background-repeat no-repeat
    &.star-48
      .star-item
        width 20px
        height 20px
        margin-right 22px
        background-size 20px 20px
        &:last-child
          margin-right 0
        &.on
          bg-image('star48_on')
        &.half
          bg-image('star48_half')
        &.off
          bg-image('star48_off')
    &.star-36
      .star-item
        width 15px
        height 15px
        margin-right 6px
        background-size 15px 15px
        &:last-child
          margin-right 0
        &.on
          bg-image('star36_on')
        &.half
          bg-image('star36_half')
        &.off
          bg-image('star36_off')
    &.star-24
      .star-item
        width 10px
        height 10px
        margin-right 3px
        background-size 10px 10px
        &:last-child
          margin-right 0
        &.on
          bg-image('star24_on')
        &.half
          bg-image('star24_half')
        &.off
          bg-image('star24_off')

</style>
