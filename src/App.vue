<template>
  <div>
    <v-header v-bind:seller="seller"></v-header>
    <div class="tab border-1px">
      <div class="tab-item">
        <router-link to="/goods">商品</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">评论</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/seller">商家</router-link>
      </div>
    </div>
    <router-view v-bind:seller="seller"></router-view>
  </div>
</template>

<script>
  import header from './components/header/header.vue';

  const ERR_OK = 0;

  export default {
    data () {
      return {
        seller: {}
      };
    },
    created() {
      this.$http.get('/api/seller').then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          this.seller = response.data;
          console.log(this.seller);
        }
      });
    },
    components: {
      'v-header': header
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "./common/stylus/mixin.styl"
    .tab
      display: flex
      width: 100%
      height: 40px
      line-height: 40px
      border-1px(rgba(7,17,27,0.1))
      .tab-item
        flex: 1
        text-align center
        & > a
          display: block
          font-size: 14px
          color: rbg(77,85,93)
          //子元素的高度和父元素相同，文字就可以居中对齐
          line-height: 40px
          &.active
            color: rgb(240,20,20)


</style>
