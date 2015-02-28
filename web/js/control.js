
var control = new Object();

control.markLock = false;

control.init = function() {
    
    $(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii',autoclose: true});

    $('#datepicker_begin,#datepicker_end').datetimepicker().on('changeDate', function(ev){
        control.updateTimeRange();
    });

    //process config
    var dirs_groups = [config.includeDir, config.includeDirWithRecursion, config.excludeDir];
    for( var idx in dirs_groups ){
        var a_dirs_group = dirs_groups[idx];

        for( var idx2 in a_dirs_group ){

            var a_dir = a_dirs_group[idx2];
            //去掉头部可能存在的 ./
            if( a_dir.indexOf("./") == 0 ){
                a_dirs_group[idx2] = a_dir.substr(2);
            }

            var a_dir = a_dirs_group[idx2];
            //去掉尾部可能存在的 /
            if( a_dir.charAt( a_dir.length -1 ) == "/" ){
                a_dirs_group[idx2] = a_dir.substr( 0,a_dir.length - 1 );
            }
        }
    }

    console.log(dirs_groups);

    //build authors list
    var authors = analyzer.getAuthors( commitsDataArray );
    console.log("authors:",authors)
    for(var idx in authors){
        var a_author = authors[idx];

        $("#author_ul").append( '<li><a onclick="control.updateAuthor(this)" author="' + a_author +'">' + a_author + '</a></li>' )
    }

    $("#author_ul").append( '<li class="divider"></li>' );
    $("#author_ul").append( '<li><a onclick="control.updateAuthor(this)">All Authors</a></li>' );

    //build branches list
    var branches = analyzer.getBranches( commitsDataArray );
    console.log("Branches:",branches)
    for(var idx in branches){
        var a_branch = branches[idx];

        $("#branch_ul").append( '<li><a onclick="control.updateBranch(this)" branch="' + a_branch +'">' + a_branch + '</a></li>' );
    }

    $("#branch_ul").append( '<li class="divider"></li>' );
    $("#branch_ul").append( '<li><a onclick="control.updateBranch(this)">All branches</a></li>' );

    //build directory
    for(var idx in config.includeDir){
        var dir = "./" + config.includeDir[idx];

        $("#include_dir_ul").append( '<li>' + dir + '</li>' );
    }

    for(var idx in config.includeDirWithRecursion){
        var dir = "./" + config.includeDirWithRecursion[idx];

        $("#include_dir_ul").append( '<li>' + dir + ' <span class="glyphicon glyphicon-th-list" aria-hidden="true" title="Include as recursion"></span></li>' );
    }

    for(var idx in config.excludeDir){
        var dir = "./" + config.excludeDir[idx];

        $("#exclude_dir_ul").append( '<li>' + dir + '</li>' );
    }

    this.show();
}

control.updateAuthor = function (li) {
    var author = $(li).attr("author"); 
    console.log("control.updateAuthor:",author);

    if( author == undefined ){
        filter.enable_author = false;
        $("#author_button").text("All authors");
    }else{
        filter.enable_author = true;
        filter.author = author;
        $("#author_button").text(author);
    }

    control.show();
}

control.updateBranch = function (li) {
    var branch = $(li).attr("branch"); 
    console.log("control.updateBranch:",branch);

    if( branch == undefined ){
        filter.enable_branch = false;
        $("#branch_button").text("All branches");
    }else{
        filter.enable_branch = true;
        filter.branch = branch;
        $("#branch_button").text(branch);
    }

    control.show();
}

control.updateTimeRange = function () {
    console.log("control.updateTimeRange");

    var beginTime = $("#datepicker_begin").val();
    beginTime = new Date(Date.parse(beginTime.replace(/-/g,   "/")));  

    var endTime = $("#datepicker_end").val();
    endTime = new Date(Date.parse(endTime.replace(/-/g,   "/")));

    console.log("update time range: " + beginTime + " ~ " + endTime);

    //trans to timestamp
    filter.time_begin = beginTime.getTime() / 1000;
    filter.time_end = endTime.getTime() / 1000;
    filter.enable_time = true;

    console.log("update time range: " + filter.time_begin + " ~ " + filter.time_end);

    control.show();
}


control.updateCommitType = function (li) {
    var commitType = $(li).text(); 
    console.log("control.updateCommitType:",commitType);

    $("#commitType_button").text(commitType);

    filter.commitType = commitType;
    filter.enable_commitType = true;

    control.show();
}

control.updateLineType = function (li) {
    var lineType = $(li).text(); 
    console.log("control.updateLineType:",lineType);

    $("#lineType_button").text(lineType);

    filter.lineType = lineType;
    filter.enable_lineType = true;

    control.show();
}


control.markCommitWithAuthor = function (tr) {
    
    var author= $(tr).attr("author");
    console.log("control.markCommitWithAuthor:",author);

    //make clean
    var commits = $('.activeAuthor');
    for(var i =0 ;i < commits.length ;i++){
        $( commits[i] ).removeClass("activeAuthor");
    }

    var doMark;
    if( control.markLock == author ){ //再次点击用来取消

    }else{
        //remark the targer author
        var commits = $('#commitsTableBody [author="' + author + '"]');
        for(var i =0 ;i < commits.length ;i++){
            $( commits[i] ).addClass("activeAuthor");
        };
    }
}

control.clear = function () {
    // body...
}


control.show = function () {
    console.log("start build report");


    var commitsAfterFilter = filter.filter_commits( commitsDataArray );

    $("#commitsTableBody").empty();
    for( idx in commitsAfterFilter){
        commit = commitsAfterFilter[idx];
        //console.log( commit );

        var html = '<tr author="' + commit["authorName"] +'" ><td>' + (commitsAfterFilter.length - idx) + "</td>" 
        var time_str = (new Date(commit["commitTime"] * 1000)).format("yyyy-MM-dd hh:mm:ss");

        html += "<td>" + commit["authorName"] + "</td>"
        html += "<td>" + commit["commitHash"].substr(0,7) + "</td>"
        html += "<td>" + time_str + "</td>"
        html += "<td>" + commit["notes"] + "</td>"
        html += "</tr>"

        $("#commitsTableBody").append(html);
    }

    //build commit report table
    var commitReport = analyzer.getCommitsReport(commitsAfterFilter,$("#commitType_button").text());
    var allCommitCount = 0;

    for (var author in commitReport) {  
        allCommitCount += commitReport[author]; 
    }

    $("#commitReportTable").empty();
    var html_nodes = new Array();
    for (var author in commitReport) {  

        var process =  parseInt((commitReport[author]/allCommitCount)*100);

        var html = '<tr class="markAble" sort_flag="' + commitReport[author] + '" author="' + author +  '" onclick="control.markCommitWithAuthor(this)"> \
                        <td class="author_report_table_td0">' + author + '</td>\
                        <td class="td1">' + commitReport[author] + '</td>\
                        <td>\
                            <div class="progress" style="margin-bottom: 0px">\
                                <div class="progress-bar" role="progressbar" aria-valuenow="' + process + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + process + '%;">\
                                ' + process + '%\
                                </div>\
                            </div>\
                        </td>\
                    </tr>';

        var a_node = $(html);
        html_nodes.push( a_node );
    }

    //sort
    var sort_core = function(a, b) {
        var process_a = parseInt( a.attr("sort_flag"));
        var process_b = parseInt( b.attr("sort_flag"));
        //console.log([process_a,process_b]);
        return process_b - process_a;
    }

    html_nodes = html_nodes.sort( sort_core );
    for(var idx in html_nodes){
        $("#commitReportTable").append( html_nodes[idx] );
    }

    //build line report
    var lineReport = analyzer.getLinesReport(commitsAfterFilter);
    var allLinesCount = 0;

    for (var author in lineReport) {  
        allLinesCount += lineReport[author]; 
    }

    $("#lineReportTable").empty();
    var html_nodes = new Array();
    for (var author in lineReport) {  

        var process =  parseInt((lineReport[author]/allLinesCount)*100);

        var html = '<tr class="markAble" sort_flag="' + lineReport[author] + '" author="' + author +  '" onclick="control.markCommitWithAuthor(this)"> \
                        <td class="author_report_table_td0">' + author + '</td>\
                        <td class="td1">' + lineReport[author] + '</td>\
                        <td>\
                            <div class="progress" style="margin-bottom: 0px">\
                                <div class="progress-bar" role="progressbar" aria-valuenow="' + process + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + process + '%;">\
                                ' + process + '%\
                                </div>\
                            </div>\
                        </td>\
                    </tr>';

        var a_node = $(html);
        html_nodes.push( a_node );
    }

    html_nodes = html_nodes.sort( sort_core );
    for(var idx in html_nodes){
        $("#lineReportTable").append( html_nodes[idx] );
    }

    console.log("show report complete");
}

//---------------
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        // month
        "d+": this.getDate(),
        // day
        "h+": this.getHours(),
        // hour
        "m+": this.getMinutes(),
        // minute
        "s+": this.getSeconds(),
        // second
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // quarter
        "S": this.getMilliseconds()
        // millisecond
    };
    if (/(y+)/.test(format) || /(Y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};