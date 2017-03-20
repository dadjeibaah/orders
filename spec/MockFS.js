function MockFS(){
    function successFile(){
      return "filename";
    }

    function errorFile(){
        return 'error';
    }
    spyOn(this,'readFileAsync').andReturn(new Promise(successFile, errorFile));
}

module.exports = MockFS;