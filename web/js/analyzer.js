
var analyzer = new Object();

analyzer.getAuthors = function (all_commits) {

    var authors = new Array();

    for( idx in all_commits){
        var commit = all_commits[idx];
        var a_author = commit["authorName"];

        if( authors.indexOf(a_author) < 0 ){
            authors.push(a_author);
        }
    }

    return authors;
}

analyzer.getBranches = function (all_commits) {

    var branches = new Array();

    for( idx in all_commits){
        var commit = all_commits[idx];
        var tmp_branches = commit["branches"];

        for( var idx_2 in tmp_branches ){
            var a_branch_name = tmp_branches[idx_2];
            
            if( branches.indexOf(a_branch_name) < 0 ){
                branches.push(a_branch_name);
            }
        }
    }

    return branches;
}

analyzer.getCommitsReport = function (all_commits){
    
    var ret = new Array();

    for( var idx in all_commits ){
        var commit  = all_commits[idx];
        var author = commit["authorName"];

        if( ret[author] == undefined ){
            ret[author] = 1;
        }else{
            ret[author] += 1;
        }
    }
    
    console.log("commit report:");
    for (var author in ret) {  
        console.log( "   *" + author + ": " + ret[author]);  
    }

    return ret;
    
}

analyzer.getLinesReport = function (all_commits){

    var ret = new Array();

    for( var idx in all_commits ){

            var commit  = all_commits[idx];
            var author = commit["authorName"];
            var changes = commit["changes"];

            if( ret[author] == undefined ){
                ret[author] = 0;
            }

            for( var changes_idx in changes ){
                var a_change = changes[changes_idx];

                var linesAddCount = a_change["lineAdd"];
                var linesRemoveCount = a_change["lineRemove"];

                ret[author] += linesAddCount + linesRemoveCount;
            }

        }

    console.log("linesModify report:");
    for (var author in ret) {  
        console.log( "   *" + author + ": " + ret[author]);  
    }

    return ret;

}



