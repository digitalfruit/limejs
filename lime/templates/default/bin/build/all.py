#!/usr/bin/env python

import subprocess
import os

bindir = os.path.dirname(os.path.realpath(__file__))

def main():
	call = 'python ' + os.path.join(bindir, 'list.py')
	subprocess.call(call,shell=True)
	call = 'python ' + os.path.join(bindir, 'script.py')
	subprocess.call(call,shell=True)
	call = 'python ' + os.path.join(bindir, 'whitespace.py')
	subprocess.call(call,shell=True)
	call = 'python ' + os.path.join(bindir, 'simple.py')
	subprocess.call(call,shell=True)
	call = 'python ' + os.path.join(bindir, 'advanced.py')
	subprocess.call(call,shell=True)

if __name__ == '__main__':
	main()
