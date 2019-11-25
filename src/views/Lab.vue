<template>
  <div class="Labrotary">
    <Row>
      <Col span="12">col-12</Col>
      <Col span="12">col-12</Col>
    </Row>
    <br />
    <Row>
      <Col span="8">col-8</Col>
      <Col span="8">col-8</Col>
      <Col span="8">col-8</Col>
    </Row>
    <br />
    <Row>
      <Col span="6">col-6</Col>
      <Col span="6">col-6</Col>
      <Col span="6">col-6</Col>
      <Col span="6">col-6</Col>
    </Row>
  </div>
</template>
<script>
export default {
  name: "Lab",
  data() {
    return {
      msg: "测试使用iView",
      list: [
        { pname: "肥皂", price: 2.5 },
        { pname: "牙刷", price: 7 },
        { pname: "洗衣粉", price: 5.5 },
        { pname: "剪刀", price: 25 },
        { pname: "毛巾", price: 3 },
        { pname: "牙膏", price: 8 }
      ]
    };
  }
};
</script>
<style scoped lang="less"></style>
