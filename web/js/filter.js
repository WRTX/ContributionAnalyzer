 
var filter = new Object();

filter.enable_author = false;
filter.author = "";

filter.enable_branch = false;
filter.branch = "";

filter.enable_time = false;
filter.time_begin = 0;//utc time stamp( s )
filter.time_end = 0;

filter.enable_commitType = true;
filter.commitType = "Commits Without Merges";

filter.enable_lineType = false;
filter.lineType = null;

filter.author_filter = function (element, index, array) {
    
    if( element["authorName"] == filter.author){
        return true;
    }else{
        return false;
    }
}

filter.branch_filter = function (element, index, array) {
    
    if( element["branches"].indexOf( filter.branch ) >= 0 ){
        return true;
    }else{
        return false;
    }
}

filter.commitType_filter = function (element, index, array) {

    if( filter.commitType == "All Commits" ){
        return true;
    }else if( filter.commitType == "Commits Without Merges" ){
        return  element["isMerge"] != true; 
    }else if(filter.commitType == "Commits Merges"){
        return  element["isMerge"] == true;
    }else{
        throw new Error("filter.commitType_filter: option is wrong!");
    }
}

filter.lineType_filter = function (element, index, array) {
    
    var changes = element["changes"];

    //console.log('**changes-->',changes);

    for( var idx in changes ){
        
        var a_change = changes[idx];

        if( filter.lineType == "All Lines Modify" ){
            
        }else if( filter.lineType == "Lines Add" ){
            a_change["lineRemove"] = 0; 
        }else if(filter.lineType == "Lines Remove"){
            a_change["lineAdd"] = 0;
        }else{
            throw new Error("filter.lineType_filter: option is wrong!",this.lineType);
        }
    }

    return true;
}


filter.time_filter = function (element, index, array) {

    if( (element["commitTime"] <= filter.time_end) && (element["commitTime"] >= filter.time_begin)){
        return true;
    }else{
        return false;
    }
}

filter.dir_filter = function (element, index, array) {
    //把未包含在统计路径中的修改移除

    var dir_match_filter = function (element, index, array) {
        var target = element["target"];
        //console.log("target:",target)

        //是否在排除目录中
        for( var idx in config.excludeDir ){
            var dir = config.excludeDir[idx];

            if( target.indexOf( dir + "/" ) == 0 ){
                return false;
            }
        }

        //是否在递归包含目录中
        for( var idx in config.includeDirWithRecursion ){
            var dir = config.includeDirWithRecursion[idx];

            if( dir == '')
                return true;

            if( target.indexOf( dir + "/" ) == 0 ){
                //console.log("*target:",target);
                return true;
            }
        }

        //是否在普通包含目录中
        for( var idx in config.includeDir ){
            var dir = config.includeDir[idx];

            if( target.indexOf( dir + "/" ) == 0 ){
                var tmp = target.substr( dir.length + 1 );

                if( tmp.indexOf("/") >= 0 ){
                    //console.log("----not in dir");

                    return false;
                }else{
                    return true;
                }
            }
        }

        return false;
    }

    var changes = element["changes"];

    element["changes"] = changes.filter(dir_match_filter);

    return true;
}




filter.filter_commits = function (all_commits) {

    var ret = JSON.parse( JSON.stringify(all_commits) ); //deep clone

    if(filter.enable_author){
        ret = ret.filter(this.author_filter);
    }

    if(filter.enable_branch){
        ret = ret.filter(this.branch_filter);
    }

    if(filter.enable_time){
        ret = ret.filter(this.time_filter);
    }

    if(filter.enable_commitType){
        ret = ret.filter(this.commitType_filter);
    }

    if(this.enable_lineType){
        ret = ret.filter(this.lineType_filter);
    }

    ret = ret.filter(this.dir_filter);

    return ret;
}