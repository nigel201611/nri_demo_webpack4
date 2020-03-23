<i18n src="./locals/index.json"></i18n>
<template>
  <div class="esl-wrap">
    <el-form
      :rules="eslRules"
      v-loading="loading"
      :element-loading-text="$t('esl-loading-text')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      class="formQuery"
      :model="formQuery"
      ref="formQuery"
      label-position="right"
      label-width="80px"
    >
      <template v-for="(item,index) in formData">
        <el-form-item :label="item.label+':'" :key="index">
          <el-input v-model="item.value" :disabled="item.disable"></el-input>
        </el-form-item>
      </template>

      <!-- formData -->
      <el-form-item label="Qty:" prop="qty">
        <el-input type="number" v-model.number="formQuery.qty" auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('formQuery')">{{$t('submit-text')}}</el-button>
        <!-- <el-button @click="resetForm('formQuery')">重置</el-button> -->
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.formQuery {
  // margin: 0 auto;
  width: 800px;
  padding: 40px 0 0 60px;
}
</style>
<script src='./eslUpdate.js'></script>

