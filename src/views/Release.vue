<template lang="html">
    <transition name="fade">
        <div class="new">
            <!-- 最近受期待 -->
            <div class="mostExpected">
                <h1 class="title">最近受期待</h1>
                <section class="recentList">
                    <ul v-infinite-scroll="loadMore"
                        infinite-scroll-disabled="loading"
                        infinite-scroll-distance="10">
                        <li @click="Tomovie(item.id)" v-for="item in mostExpected" :key="item.id">
                            <div class="img">
                                <img v-lazy="picFix(item.img)" alt="">
                                <p class="wish">{{item.wish}}人想看</p>
                            </div>
                            <h3 class="nm">{{item.nm}}</h3>
                            <span class="comingTitle">{{item.comingTitle.substr(0,10)}}</span>
                        </li>
                    </ul>
                </section>
            </div>
            <!-- 电影列表 -->
            <div class="coming-list">
                <ul class="clearfix">
                    <li v-for="(item,index) in timeTitle" :key="item.index">
                        <p class="comingTitle">{{index}}</p>
                        <div v-for="coming in item" :key="coming.id">
                            <div class="content" @click="movie_detail(coming.id)">
                                <div class="img">
                                    <img v-lazy="picFix_coming(coming.img)" alt="">
                                </div>
                                <div class="right-content textOverflow1">
                                    <h1 class="nm">{{coming.nm}}</h1>
                                    <div class="wish">
                                        <span class="wish_1">{{coming.wish}}</span>
                                        <span class="peo">人想看</span>
                                    </div>
                                    <h3 class="star textOverflow1">{{coming.star}}</h3>
                                    <p class="showInfo">{{coming.showInfo}}</p>
                                </div>
                                <!-- 购票预售组件 -->
                                <div class="btn">
                                    <button class="btn1" v-if="coming.preShow">想看</button>
                                    <button v-else class="btn2">预售</button>
                                </div>
                            </div>
                        </div>
                    </li>
                    <!-- loading 加载组件 -->
                    <div class="loading" v-show="hasMore">
                        <mt-spinner color="rgb(100, 100, 100)" type="fading-circle"></mt-spinner>
                    </div>
                </ul>
            </div>
        </div>
    </transition>
</template>
<script>
// import MyButton from '@/components/myButton.vue'
export default {
  /**
   * [lang description]
   * @type {String}
   */
  created() {
    let that = this;
    this.ciId = this.$store.state.cityId;
    this.axios
      .get("/ajax/comingList", {
        params: {
          ci: this.ciId, // 城市id
          limt: 10,
          token: "",
        },
      })
      .then((res) => {
        this.coming = res.data.coming;
        this.movieIds = res.data.movieIds;
        this.fenzu();
        document.addEventListener(
          "scroll",
          this.fangdou(function () {
            that.moreComingList(that.movieIds);
          }, 500)
        );
      });
    this.most_Expected(this.offset);
  },
  data() {
    return {
      mostExpected: [],
      coming: [],
      title: ["想看", "预售"],
      ciId: "",
      movieIds: [],
      offset: 0,
      timeTitle: {}, // 日期分组
      hasMore: true, // 是否存在更多，加载的时候
    };
  },
  methods: {
    picFix(wh) {
      if (wh !== undefined) {
        return wh.replace("w.h", "85.115");
      }
    },
    picFix_coming(wh) {
      if (wh !== undefined) {
        return wh.replace("w.h", "64.90");
      }
    },
    most_Expected(offset) {
      this.axios
        .get("/ajax/mostExpected", {
          params: {
            ci: this.ciId,
            limit: 10,
            offset: offset, // 请求数量
            token: "",
          },
        })
        .then((res) => {
          if (res.data.coming.length !== 0) {
            // 请求coming为空时，不在请求
            this.mostExpected = this.mostExpected.concat(res.data.coming);
          } else {
            return false;
          }
        });
    },
    loadMore() {
      this.loading = true;
      this.offset += 10;
      this.most_Expected(this.offset);
      this.loading = false;
    },
    // 防抖
    fangdou(callback, delay) {
      // 定时器
      var timer;
      return function () {
        if (timer) {
          // 引用外部函数的timer
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          callback.apply(this, arguments);
        }, delay);
      };
    },
    fenzu() {
      // 遍历数组所有的成员，以成员的某个数据作为分组的组名
      // 在添加之前，先判断对象上的属性名是否存在，若不存在则设置一个空数组
      // 将成员添加到对应的属性上（数组）
      this.coming.forEach((item) => {
        if (!this.timeTitle[item.comingTitle]) {
          this.timeTitle[item.comingTitle] = [];
        }
        this.timeTitle[item.comingTitle].push(item);
      });
    },
    // moreComingList
    moreComingList(movieIds) {
      let flag = false;
      let that = this;
      let scrollTop = document.documentElement.scrollTop; // 滚动高度
      let pageHeight = document.documentElement.scrollHeight; // 页面高度
      let innerHeight = window.innerHeight;
      if (scrollTop + innerHeight == pageHeight && flag == true) {
        flag = false;
      }
      let arrIndex = 12;
      let limit = 10;
      let tosee = movieIds.splice(arrIndex, limit);
      tosee = tosee.join(",");
      that.axios
        .get("/ajax/moreComingList", {
          params: {
            ci: this.ciId,
            token: "",
            limit: 10,
            movieIds: tosee,
          },
        })
        .then((res) => {
          if (res.data.coming.length !== 0) {
            res.data.coming.forEach((item) => {
              if (!that.timeTitle[item.comingTitle]) {
                that.timeTitle[item.comingTitle] = [];
              }
              this.$forceUpdate(); // 迫使 Vue 实例重新渲染。
              that.timeTitle[item.comingTitle].push(item);
            });
          } else {
            this.hasMore = !this.hasMore;
            return false;
          }
        });
    },
    //    电影详情
    movie_detail(id) {
      this.$router.push({
        name: "movie_detail",
        params: {
          movieId: id,
        },
      });
    },
    Tomovie(id) {
      this.$router.push({
        name: "movies",
        params: {
          movieId: id,
        },
      });
    },
  },
  computed: {
    changeCity() {
      //数据依赖更新是，计算属性重新触发更新
      return this.$store.state.cityId;
    },
  },
  components: {
    //    MyButton
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/sass/release.scss";
.btn {
  position: absolute;
  top: 50%;
  right: 6%;
  transform: translateY(-50%);
}
.fade-enter {
  opacity: 0;
  transform: translateY(40px);
}
.fade-enter-active {
  transition: all 0.8s;
}
.loading {
  position: absolute;
  left: 50%;
  // bottom: -20px;
  transform: translateX(-50%);
}
</style>
