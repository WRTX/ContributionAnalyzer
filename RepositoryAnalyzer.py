#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @Date    : 2015-02-25 14:03:13
# @Author  : Alexa (AlexaZhou@gmail.com)
# @Link    : 
# @Disc    : 

import datetime
import subprocess
import collections
import json
import sys
import os
import webbrowser as wb


class Change:

    lineAdd = 0
    lineRemove = 0
    target = ''

    def setWitLog(self,log):
        tmp = log.split('\t')

        if tmp[0] == '-':
            self.lineAdd = 0
        else:
            self.lineAdd = int(tmp[0])

        if tmp[1] == '-':
            self.lineRemove = 0
        else:
            self.lineRemove = int(tmp[1])

        self.target = tmp[2]

class Commit:
    
    branches = []
    commitHash = None
    commitTime = None
    authorName = None
    authorEmail = None
    notes = None
    changes = []
    isMerge = False

    def setWithLogStr(self,logStr):
        #print(logStr)
        logMetas = logStr.strip('\n').split('\n')
        self.commitHash = logMetas[0][ logMetas[0].index(':')+1: ]
        commitTimeStr = logMetas[1][ logMetas[1].index(':')+1: ]
        self.commitTime = int(commitTimeStr) #datetime.datetime.fromtimestamp( int(commitTimeStr) )
        self.authorName = logMetas[2][ logMetas[2].index(':')+1: ]
        self.authorEmail = logMetas[3][ logMetas[3].index(':')+1: ]
        self.notes = logMetas[4][ logMetas[4].index(':')+1: ]
        self.changes = []
        self.branches = []
        self.isMerge = False
        for line in logMetas[5:]:
            change = Change()
            change.setWitLog(line)

            self.changes.append(change)


#把MyObj对象转换成dict类型的对象
def convert_to_builtin_type(obj):
    d = {}
    d.update(obj.__dict__)
    return d


def show_help():

    print('''command formate: "./RepositoryAnalyzer <RepoDirctory>" ''') 
    print('''Type this command to build a git report\n''')

def main():

    if len(sys.argv) != 2:
        show_help()
        return

    if len( sys.argv ) == 2 and sys.argv[1].strip("-") == 'help':
        show_help()
        return

    exec_dir = os.getcwd()

    #switch to git repo dir
    git_repo_dir = sys.argv[1]
    os.chdir( git_repo_dir )
    print("start Analyze git repo ")

    #makesure git tool existed
    logStr = subprocess.getoutput("git --version")
    if "git" in logStr.lower():
        print("Use:",logStr)
    else:
        print("Error: Can't found git one the computer")
        return

    #makesure the dir is a git repo
    logStr = subprocess.getoutput("git log -n 1")
    if "fatal" in logStr.lower():
        print("Error: maybe the dirctory is not a git repository")
        return
    
    commits = collections.OrderedDict()

    #get all commit node info
    print("get all commits info...")
    cmd = '''git log --pretty=format:"*#*#*#Commit*#*#*#%nCommit Hash:%H%nCommit Time:%ct%nAuthor Name:%an%nAuthor Email:%ae%nNotes:%s" --numstat --all'''
    logStr = subprocess.getoutput(cmd)
    
    tmp = logStr.split('*#*#*#Commit*#*#*#\n')
    notEmpty = lambda x: x != ""
    logStrList = list(filter( notEmpty, tmp))

    for log in logStrList:
        commit = Commit()
        commit.setWithLogStr(log)
        #print(commit)
        commits[commit.commitHash] = commit

    #mark commit node of merge
    print("get merge info...")
    cmd = '''git log --merges | grep ^commit'''
    logStr = subprocess.getoutput(cmd)
    for line in logStr.strip('\n').split('\n'):
        if line == "":
            continue
        hashStr = line[ line.index(' ')+1:]
        #print(hashStr)
        commits[hashStr].isMerge = True#mark commit
 
    #get branch info
    branchs = []
    branchStr = subprocess.getoutput("git branch").strip('\n')
    #print(branchStr)
    for line in branchStr.split('\n'):
        branchs.append( line.lstrip('* ') )

    print("branchs:",branchs)

    #mark commits with branch info
    print("mark commits belongs master...")
    cmd = '''git log master | grep ^commit'''
    logStr = subprocess.getoutput(cmd)
    for line in logStr.strip('\n').split('\n'):
        hashStr = line[ line.index(' ')+1: ]
        #print(hashStr)
        commits[hashStr].branches.append("master")

    for name in branchs:
        if name == 'master':
            continue
        print('analyze branch: %s'%name)
        cmd = '''git log %s | grep ^commit'''%name
        logStr = subprocess.getoutput(cmd)
        for line in logStr.strip('\n').split('\n'):
            hashStr = line[ line.index(' ')+1: ]
            commits[hashStr].branches.append( name )

    #output commits with json type
    print("trans to json...")
    commitList = []
    for key in commits:
        commitList.append(commits[key])

    commitJson = json.dumps(commitList , default=convert_to_builtin_type , indent=4)

    #detect config file
    config = None
    try:
        f = open( "./analyzerConfig.js",'rb' )
        config = f.read();
        print("Apply config file ok")
    except:
        print('The Repo has no "analyzerConfig.js" file, so use the default config')

    #switch to script dir
    os.chdir( exec_dir )
    if( os.path.split( sys.argv[0] )[0] ) != "":
        os.chdir( os.path.split( sys.argv[0] )[0] )

    #print(commitJson)
    with open("./GitRepoInfo/commitsData.js",'w') as f:
        tmp = "var commitsDataArray = %s;"%commitJson
        f.write(tmp)

    if config == None:#load default config
        with open("./Template/analyzerConfig.js",'rb') as f:
            config = f.read()

    with open("./GitRepoInfo/analyzerConfig.js",'wb') as f:
            f.write(config)

    print("Analyzer Git Repo complete")
    wb.open_new_tab("file://" + os.getcwd() + "/web/GitRepoAnalyzer.html")


if __name__ == '__main__':
    main()
else:
    print ('***.py had been imported as a module')

