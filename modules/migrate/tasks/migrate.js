var co = require('co');
var fs = require('fs');
var execSync = require('child_process').execSync;
var MigrationManager = require('migrate').MigrationManager;
var projectRoot = require('config').projectRoot;
var path = require('path');
var gutil = require('gulp-util');

/**
 * Usage:
 * gulp deploy:migrate on remote server
 * @returns {Function}
 */
module.exports = function() {

  return function() {

    return co(function*() {

      var migrationManager = new MigrationManager();
      yield* migrationManager.loadState();

      if (!migrationManager.findNextMigration(1)) {
        gutil.log("Migrations not found");
        return;
      }

      gutil.log("Migrations found, stopping to apply, in maintenance mode");
      fs.writeFileSync(path.join(projectRoot, '.maintenance'), '');
      execSync('/usr/local/bin/pm2 stop js'); // todo gracefulShutdown

      gutil.log("Migrations, applying all up");

      yield migrationManager.migrateAllUp();

      gutil.log("Migrations done");
      fs.unlinkSync(path.join(projectRoot, '.maintenance'));
    });

  };

};
