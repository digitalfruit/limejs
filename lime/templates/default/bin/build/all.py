#!/usr/bin/env python

import subprocess

def main():
	call = ''
	call += 'python list.py '
	call += 'python script.py '
	call += 'python whitespace.py '
	call += 'python simple.py '
	call += 'python advanced.py '

	subprocess.call(call,shell=True)
if __name__ == '__main__':
	main()
