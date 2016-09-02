function DeleteOldDatabaseBackups() {
  
  // initialize some variables
  var i = 0;
  var scriptError = false;
  
  // clear the log
  Logger.clear();
  
  // get properties to work with
  var scriptProperties = PropertiesService.getScriptProperties();
  var folderId = scriptProperties.getProperty("Backup Folder ID");
  var extensionToDelete = scriptProperties.getProperty("Extension to Delete");
  var emailTo = scriptProperties.getProperty("E-mail Report To");
  var deleteAfterDays = parseInt(scriptProperties.getProperty("Delete After Days"));
  
  // check if deleteAfterDays is NaN. If so, log it and stop execution
  if (isNaN(deleteAfterDays)) {
    
    Logger.log("The script property 'Delete After Days' is not a number. Please fix this and re-run the script. Stopping Execution");
    scriptError = true;
  
  } else {
    
    var deleteBeforeDate = new Date().getTime() - (1000 * 3600 * 24 * deleteAfterDays);
    // 1000ms     3600s       24h        x 
    // ------  *  ------  *  -----  *  ------ , where x is the number of days (d) specified in the script properties.
    //   1s         1h        1d         1  
  
    var backupFolder = DriveApp.getFolderById(folderId);
    var files = backupFolder.getFiles();
    
    while (files.hasNext()) {
      var file = files.next();
      
      var fileContainsExtension = file.getName().toLowerCase().indexOf(extensionToDelete) > -1;
      if (fileContainsExtension && file.getDateCreated().getTime() < deleteBeforeDate) {
        file.setTrashed(true);
        Logger.log(file.getName() +' created on ' + Utilities.formatDate(file.getDateCreated(), 'PST','MMM-dd-yyyy h:m:s a') + ' has been deleted.')
        i++;
      }
    }
  }
  
  // send e-mail with log to lovewoof-backups@lovewoof.org if there were any deletions, or if there is an error
  var dateOfExecution = Utilities.formatDate(new Date(), 'PST', 'MMM-dd-yyyy h:m:s a');
  var emailSubject = "Delete Old Database Backups Report for " + dateOfExecution;
  if ( i > 0 || scriptError ) {
    MailApp.sendEmail(emailTo, emailSubject, Logger.getLog());
  } else {
    Logger.log("No files to backup, or none that fit the criteria of " + deleteAfterDays + " days old.");
    MailApp.sendEmail(emailTo, emailSubject, Logger.getLog());
  }
}