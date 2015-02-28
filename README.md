#Git Repo Analyzer

一个用来分析Git仓库贡献构成的工具

##特性

* 强大的可自定义过滤器
 > * 路径过滤
 > * 时间段过滤
 > * Merge commit过滤
 > * 分支，提交者 过滤
   
* 多维度贡献统计功能
>  * commit次数
>  * 添加,删除,修改的行数

##使用

执行以下命令

    ./RepositoryAnalyzer <RepoDirctory>
    
注: 在Report中点击一个Author可以将底部相应的commit高亮

##配置

对一些Git仓库，我们会希望能自定义进行统计的目录，这时可以通过自定义配置来达到目的
>比如仓库中有一个第三方库，我们希望统计修改行数的时候，排除掉这个库的目录。

GitRepoAnalyzer 默认对git仓库目录下面所有修改进行统计。  

如果需要自定义，需要把 GitRepoAnalyzer/Template/ 目录中的 analyzerConfig.js 复制到要统计的目录中，analyzerConfig.js 中有三个列表可以进行配置。

* includeDir 这个列表中的目录里的代码修改会进行行数统计(不包含子目录)
* includeDirWithRecursion 这个列表中的目录里的代码修改会进行行数统计( 含子目录)
* excludeDir 这个列表的目的是在上面两个列表中排除掉一部分（含子目录）

##依赖
* python3