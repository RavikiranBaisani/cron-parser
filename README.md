# cron-parser
<h3>Installations</h3>
1. Requires NodeJs latest version to be installed

<h3>Steps to run</h3> 
1. node parser.js "*/15 0 1,15 * 1-5 /usr/bin/find"

<h3>Sample output</h3>
minute        0,15,30,45<br/>
hour          0<br/>
day of month  1,15<br/>
month         1,2,3,4,5,6,7,8,9,10,11,12<br/>
day of week   1,2,3,4,5<br/>
command       /usr/bin/find
