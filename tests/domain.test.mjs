import assert from 'node:assert/strict';
import {balance,centsFromInput,validDate} from '../lib/domain.ts';
assert.equal(centsFromInput('10,99'),1099);assert.equal(centsFromInput('0.01'),1);assert.equal(centsFromInput('100'),10000);
for(const v of ['-4','12,345','abc','1e2','Infinity'])assert.throws(()=>centsFromInput(v));
assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('2026-13-02'),false);
const ledger=[{kind:'expense',member:0,cents:10000},{kind:'expense',member:1,cents:20000}];
assert.equal(balance(ledger),-5000);assert.equal(balance([...ledger,{kind:'settlement',member:0,cents:5000}]),0);
assert.equal(balance([{kind:'expense',member:0,cents:10001}]),5000);
assert.equal(balance([{kind:'expense',member:1,cents:10001}]),-5001);
assert.equal(balance([{kind:'expense',member:0,cents:10000},{kind:'settlement',member:1,cents:2000}]),3000);
assert.equal(balance([{kind:'expense',member:0,cents:10000},{kind:'settlement',member:1,cents:7000}]),-2000);
for(let amount=1;amount<10000;amount++){const first=Math.ceil(amount/2),second=Math.floor(amount/2);assert.equal(first+second,amount);assert.equal(balance([{kind:'expense',member:0,cents:amount}]),second);assert.equal(balance([{kind:'expense',member:1,cents:amount}]),-first);}
console.log('PASS: decimal input, dates, equal split, odd cents, repayments and overpayments.');
