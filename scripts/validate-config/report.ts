/* eslint-disable no-console */
import { getMessages } from './messages';

export const printReport = (): void => {
  const allMessages = getMessages();
  const errors = allMessages.filter((m) => m.level === 'error');
  const warnings = allMessages.filter((m) => m.level === 'warning');

  console.log('');
  console.log('=== JSON Config Validation Report ===');
  console.log('');

  if (errors.length > 0) {
    console.log('ERRORS (build will be blocked):');
    console.log('');
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.path}]`);
      console.log(`     ${err.message}`);

      if (err.details) {
        err.details.split('\n').forEach((line) => {
          console.log(`     ${line}`);
        });
      }

      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('WARNINGS (build will proceed):');
    console.log('');
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. [${warn.path}]`);
      console.log(`     ${warn.message}`);

      if (warn.details) {
        warn.details.split('\n').forEach((line) => {
          console.log(`     ${line}`);
        });
      }

      console.log('');
    });
  }

  console.log(`=== ${errors.length} errors, ${warnings.length} warnings ===`);

  if (errors.length > 0) {
    console.log('=== BUILD BLOCKED due to validation errors ===');
    process.exit(1);
  } else {
    if (warnings.length === 0) {
      console.log('=== Validation passed ===');
    }

    process.exit(0);
  }
};
