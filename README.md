## 软件介绍
如果你平时管理文件喜欢对它进行评分或者备注，当对文件移动或者存放到NAS之后，这些文件就很难记得它的信息了，比如：电影，照片之类。
而 **FS媒体管理器** 是为了解决这个问题诞生的，通过文件的hash信息来关联，这样就算文件移动了位置还能马上打开它

## 软件功能
- 根据路径建立文件hash组合索引
- 文件评分，分类，备注；筛选
- 打开，删除文件。打开文件所在文件夹
- 查找重复文件，根据文件大小、评分排序
- 双击文件名列直接打开文件,双击路径列打开文件夹

## 使用建议
建议用来管理不再变化的文件，本软件是通过修改的时间和大小来建立hash，修改文件后会造成hash改变
本软件使用electron，Vue+electron，typeorm+sqlite开发，如需备份数据请备份文件夹下的 **data.db** 数据库文件
软件为个人开发，功能不完善请理解并提下建议

## 软件截图
![](http://blog.cmtspace.cn/wp-content/uploads/2022/01/QQ截图20220106192934-1024x565.png)

## 软件下载

[免安装版下载](http://119.91.89.90/fs_media_manager.zip "免安装版下载")


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```
