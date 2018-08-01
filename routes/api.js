/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});


const store = {
/*  test: {
    issues: [ {
      issue_title:'aa', 
      issue_text:'a', 
      created_by:'aa', 
      assigned_to:'a', 
      status_text:'aa',
      created_on:'1/1/1 0:1:3',
      updated_on:'1/1/1 1:1:1', 
      open:false, 
      _id:''
    }]
  }
*/  
};

module.exports = function (app) {
/*
I can POST /api/issues/{projectname} with form data containing required issue_title, issue_text, created_by, and optional assigned_to and status_text.
The object saved (and returned) will include all of those fields (blank for optional no input) and also include created_on(date/time), updated_on(date/time), open(boolean, true for open, false for closed), and _id.
I can PUT /api/issues/{projectname} with a _id and any fields in the object with a value to object said object. Returned will be 'successfully updated' or 'could not update '+_id. This should always update updated_on. If no fields are sent return 'no updated field sent'.
I can DELETE /api/issues/{projectname} with a _id to completely delete an issue. If no _id is sent return '_id error', success: 'deleted '+_id, failed: 'could not delete '+_id.
I can GET /api/issues/{projectname} for an array of all issues on that specific project with all the information for each issue as was returned when posted.
I can filter my get request by also passing along any field and value in the query(ie. /api/issues/{project}?open=false). I can pass along as many fields/values as I want.
*/
  let ID = 1;
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
 
      //check for filters
   // console.log(req.query);
      const allFilters = {...req.query}
      const filterKeys = Object.keys(allFilters)

      if(req.query.open){
        allFilters.open = req.query.open === 'true'
      }
      if(req.query.created_on){
        allFilters.created_on = new Date(req.query.created_on)
      }
      if(req.query.updated_on){
        allFilters.updated_on = new Date(req.query.updated_on)
      }
    
      if(filterKeys.length){
        return res.json(store[project].filter(issue=>filterKeys.every(key=>issue[key]===allFilters[key])))
      }

      //no filter, return everything
      return res.status(200).json(store[project])
    })
    
    .post(function (req, res){
      var project = req.params.project;
      //save on store
      //console.log("post",req.body);
     const data = {
        assigned_to: '',
        status_text: '',
        ...req.body,
        created_on: new Date(),
        updated_on: new Date(),
        _id: ID++,
        open: true
      }
     if (!store[project]) {
      store[project]=[data]
     } else {
       store[project].unshift(data)
     }
    //fresh created.. soo only have 1 issue on the aarray of issues, return the first (only) element
      return res.status(200).json(store[project][0])
    })
    
    .put(function (req, res){
      var project = req.params.project;
    
      let { _id } = req.body;
    
      let updateFieldsCount =  Object.keys(req.body).length
      if (updateFieldsCount < 1){
        return res.send('no updated field sent')
      }
    
      if (_id && updateFieldsCount > 1){ // _id passsed and something else
        let issue = store[project].find(i => i._id == _id)//since my fake id are numeric.. and id from param are string.. comparing with == should be ok
        if (issue){
          issue.updated_on = Date();
          issue = {...issue, ...req.body}
          return res.send('successfully updated')
        }
      }
      return res.send('could not update '+_id)
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      let {_id} = req.body;
      if(!_id){
        res.send('_id error')
      }
    
        let issueIndex = store[project].findIndex(i => i._id == _id) //since my fake id are numeric.. and id from param are string.. comparing with == should be ok
   //     console.log("aki",_id, issue, store);
        if (issueIndex>-1){
          
          //splice it
          store[project].splice(issueIndex,1)
          return res.send('deleted '+ req.body._id)
        }
        return res.send('could not delete '+ req.body._id)
    
    });
    
};
