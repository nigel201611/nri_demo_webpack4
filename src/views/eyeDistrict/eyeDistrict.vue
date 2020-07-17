<!--
 * @Author: nigel
 * @Date: 2020-06-23 10:11:53
 * @LastEditTime: 2020-07-17 11:31:33
--> 
<i18n src="./locals/index.json"></i18n>
<template>
  <div class="eyeDistrict-wrap">
    <div class="nine_block">
      <div v-for="(item,index) in blocks" :key="index" class="row">
        <div v-for="(column,index2) in item.row" :key="index+'_'+index2" class="nine_block-item">
          <span>{{ curEyeResult==column.msg?column.num:'' }}</span>
        </div>
      </div>
      <!-- <div v-for="(item,index) in 9" :key="index" class="nine_block-item">
        <div class="animate__animated  animate__fadeInDown">{{ curEyeResult==item.msg?item.num:'' }}</div>
        <span>{{ index+1 }}</span>
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      blocks: [
        {
            row:[
            { msg: "one", num: 1 },
            { msg: "two", num: 2 },
            { msg: "three", num: 3 },
          ]
        },
        {
            row:[
            { msg: "four", num: 4 },
            { msg: "five", num: 5 },
            { msg: "six", num: 6 },
          ]
        },
        {
            row:[
            { msg: "seven", num: 7 },
            { msg: "eight", num: 8 },
            { msg: "nine", num: 9 },
          ]
        },
        
        // { msg: "four", num: 4 },
        // { msg: "five", num: 5 },
        // { msg: "six", num: 6 },
        // { msg: "seven", num: 7 },
        // { msg: "eight", num: 8 },
        // { msg: "nine", num: 9 }
      ], //区块数组
      curEyeResult: 'one' //接收到的当前区域
    };
  },
  computed: {
    ...mapState({
      locals: state => state.menuStore.locals
    })
  },
  watch: {
    locals(val) {
      this.$i18n.locale = val;
    },
    // curEyeResult: function(newValue) {
    //   gsap.to(this.$data, { duration: 1, curEyeResult: newValue });
    // }
  },
  mounted() {
    this.callEyeWebsocket();
  },
  destroyed() {},
  methods: {
    callEyeWebsocket() {
      let socket = io("http://127.0.0.1:80");
      socket.on("opend", function(data) {
        console.log("opend:", data);
      });
      socket.on("pythonEyeDistrictFromNode", data => {
        this.isConfirm = false;
        if (data.code == "0") {
          let result = data.result;
          this.curEyeResult = result;
        } else {
          console.log(data);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.nine_block {
  display: flex;
  flex-wrap: wrap;
  // flex-direction: column;
  justify-content: space-between;
  margin: 30px 0 0 30px;
  width: 84vw;
  height: 84vh;
  .row {
    flex-basis: 27.2vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .nine_block-item {
    flex-basis: 100%;
    height: 26vh;
    border: 1px solid #cecece;
    box-sizing: border-box;
    text-align: center;
    line-height: 26vh;
    color: #12abe3;
    font-size: 48px;
    margin:10px 0 10px 0;
    span {
      display: inline-block;
    }
  }
}
</style>