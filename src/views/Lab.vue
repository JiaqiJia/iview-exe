<template>
  <div class="Labrotary">
    <Table :columns="tcolumns" :data="showData"></Table>
    <Button type="primary" @click="printArray">点击获取信息</Button>
  </div>
</template>
<script>
export default {
  name: "Lab",
  data() {
    return {
      msg: "测试使用iView",
      list: [
        { pname: "肥皂", price: 2.5, instore: 100},
        { pname: "牙膏", price: 7, instore: 200 },
        { pname: "洗衣粉", price: 5.5, instore: 100 },
        { pname: "剪刀", price: 25, instore: 150 },
        { pname: "毛巾", price: 3, instore: 200 },
        { pname: "牙膏", price: 8, instore: 100 },
        { pname: "洗衣粉", price: 6, instore: 300 },
        { pname: "剪刀", price: 20, instore: 200 },
        { pname: "牙膏", price: 8, instore: 500 },
        { pname: "洗衣粉", price: 9, instore: 300 },
        { pname: "剪刀", price: 30, instore: 200 },
      ],
      tempArray:
      [
            {label: "肥皂",
            value: "肥皂"},
            {label: "牙膏",
            value: "牙膏"},
            {label: "洗衣粉",
            value: "洗衣粉"},
            {label: "剪刀",
            value: "剪刀"},
            {label: "毛巾",
            value: "毛巾"},
          ],
      tcolumns: [
        {
          title: "产品价格",
          key: "price",
          tooltip: true
        },
        {
          title: "库存明细",
          key: "instore",
          tooltip: true
        },
      ],
      showData: [],

      filterToUse: [],
    };
  },
  mounted(){
    // this.$nextTick(function(){
    //   
    // });
    this.init();
    //this.$forceUpdate();
  },
  methods: {
    getUniqueNames(){
      let nameList = this.showData.map(ele => ele.pname);
      let uniqueNames = [];
      nameList.forEach(ele => {
        if (uniqueNames.indexOf(ele) == -1) {
          uniqueNames.push(ele);
        }
      });

      let result = uniqueNames.map(ele => {return { label: ele, value: ele };});
      return result;
    },
    init(){
      this.showData = this.list;
      this.filterToUse = this.getUniqueNames();
      this.getColumns();
    },

    getColumns(){
      var newColumn = {
          title: "产品名称",
          key: "pname",
          tooltip: true,
          filters: this.getUniqueNames(),//this.filterToUse,this.getUniqueNames(),
          filterMultiple: false,
          filterMethod (value, row){
            return row.pname == value;
          }
        };
      this.tcolumns.unshift(newColumn);
    },

    printArray(){
      console.log(this.showData);
      console.log(this.filterToUse);
    }
  }
};
</script>
<style scoped lang="less"></style>
