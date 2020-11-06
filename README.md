# hexo-include-image 0.0.1
Version 0.0.1

用于将markdown文章内的图片下载到本地，并且使用[Tag Plugin](//hexo.io/docs/tag-plugins#Embed-image)语法替换图片。

**前提**: 将根目录的`_config.yml`中的`post_asset_folder`设置为`true`，Hexo 3以及Hexo 3以上的版本才内置了tag plugin，所以Hexo 3以下的版本需要安装Tag Plugin依赖。了解更多[Asset Folders](https://hexo.io/docs/asset-folders)

### Usage

```bash
$ git clone https://github.com/todoi/hexo-include-image.git
$ cd hexo-include-image && npm i
$ npx ts-node src/cli.ts -P [你的博客保存目录]
```

Example:
```bash
npx ts-node src/cli.ts -P ../blog/source/_posts
```

### Description
1. 如果检测到文章内有需要下载到本地的图片，会在`_posts`目录下面创建与文章同名的目录 
2. 图片下载之后会自动保存到`_posts`文章同名目录下
3. 替换之后结果
原来的引入图片方式
```bash
![xxx](https://zhgzhg.me/images/avatar.jpg)
```
替换之后
```bash
{% asset_img avatar.jpg "xxx'src-https://zhgzhg.me/images/avatar.jpg'"%}
```

### Warning
- 这个脚本只能下载和替换以markdown语法`![]()`引入的图片，对于html标签`<img>`引入的图片不起作用
- 操作之前请做好commit或者备份，以免数据丢失