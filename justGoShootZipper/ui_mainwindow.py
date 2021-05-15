# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'mainwindow.ui'
##
## Created by: Qt User Interface Compiler version 6.0.2
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import *
from PySide6.QtGui import *
from PySide6.QtWidgets import *


class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        if not MainWindow.objectName():
            MainWindow.setObjectName(u"MainWindow")
        MainWindow.resize(800, 600)
        self.centralwidget = QWidget(MainWindow)
        self.centralwidget.setObjectName(u"centralwidget")
        self.src = QPushButton(self.centralwidget)
        self.src.setObjectName(u"src")
        self.src.setGeometry(QRect(330, 50, 80, 22))
        self.label = QLabel(self.centralwidget)
        self.label.setObjectName(u"label")
        self.label.setGeometry(QRect(40, 60, 57, 14))
        self.dest = QPushButton(self.centralwidget)
        self.dest.setObjectName(u"dest")
        self.dest.setGeometry(QRect(330, 100, 80, 22))
        self.label_2 = QLabel(self.centralwidget)
        self.label_2.setObjectName(u"label_2")
        self.label_2.setGeometry(QRect(40, 100, 111, 16))
        self.label_3 = QLabel(self.centralwidget)
        self.label_3.setObjectName(u"label_3")
        self.label_3.setGeometry(QRect(40, 140, 111, 16))
        self.checkBox = QCheckBox(self.centralwidget)
        self.checkBox.setObjectName(u"checkBox")
        self.checkBox.setGeometry(QRect(330, 150, 85, 20))
        self.label_4 = QLabel(self.centralwidget)
        self.label_4.setObjectName(u"label_4")
        self.label_4.setGeometry(QRect(40, 180, 111, 16))
        self.compress = QSlider(self.centralwidget)
        self.compress.setObjectName(u"compress")
        self.compress.setGeometry(QRect(330, 190, 261, 16))
        self.compress.setOrientation(Qt.Horizontal)
        self.createZip = QPushButton(self.centralwidget)
        self.createZip.setObjectName(u"createZip")
        self.createZip.setGeometry(QRect(30, 240, 80, 22))
        self.reset = QPushButton(self.centralwidget)
        self.reset.setObjectName(u"reset")
        self.reset.setGeometry(QRect(140, 240, 80, 22))
        MainWindow.setCentralWidget(self.centralwidget)
        self.menubar = QMenuBar(MainWindow)
        self.menubar.setObjectName(u"menubar")
        self.menubar.setGeometry(QRect(0, 0, 800, 19))
        MainWindow.setMenuBar(self.menubar)
        self.statusbar = QStatusBar(MainWindow)
        self.statusbar.setObjectName(u"statusbar")
        MainWindow.setStatusBar(self.statusbar)

        self.retranslateUi(MainWindow)

        QMetaObject.connectSlotsByName(MainWindow)
    # setupUi

    def retranslateUi(self, MainWindow):
        MainWindow.setWindowTitle(QCoreApplication.translate("MainWindow", u"MainWindow", None))
        self.src.setText(QCoreApplication.translate("MainWindow", u"...", None))
        self.label.setText(QCoreApplication.translate("MainWindow", u"source", None))
        self.dest.setText(QCoreApplication.translate("MainWindow", u"...", None))
        self.label_2.setText(QCoreApplication.translate("MainWindow", u"destnation ", None))
        self.label_3.setText(QCoreApplication.translate("MainWindow", u"watermark", None))
        self.checkBox.setText("")
        self.label_4.setText(QCoreApplication.translate("MainWindow", u"compress", None))
        self.createZip.setText(QCoreApplication.translate("MainWindow", u"Create Zip", None))
        self.reset.setText(QCoreApplication.translate("MainWindow", u"Reset", None))
    # retranslateUi

