#!/usr/bin/python
import os

print 'Content-Type: text-html\n\n'

print '<html><body>'
print '<ul>'
for x in os.listdir('.'):
	print '<li><a href="%s">%s</a></li>' % (x, x)
print '</ul>'
print '</body></html>'