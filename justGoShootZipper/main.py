import sys
import os
from PyQt5.QtWidgets import QApplication, QWidget, QPushButton , QCheckBox , QSlider, QLabel, QFileDialog, QLineEdit
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import  Qt 
from zipfile import ZipFile
import shutil

from PIL import Image

class App(QWidget):


    def __init__(self):
        super().__init__()
        self.title = 'Just Go Shoot File Zipper'
        self.left = 10
        self.top = 10
        self.width = 640    
        self.height = 480
        self.initUI()

    def open_src(self ):
        srcDir = QFileDialog.getExistingDirectory(None, 'Select Project Folder:', '', QFileDialog.ShowDirsOnly)
        self.src.setText(srcDir)
        self.src.resize(350, 35)
        self.update()

    def open_dest(self ):
        destDir = QFileDialog.getExistingDirectory(None, 'Set Output Folder:', '', QFileDialog.ShowDirsOnly)
        self.dest.setText(destDir)
        self.dest.resize(350, 35)
        self.update()


        
    def clicked_confirm(self ):
        #check all touched
        if len(self.projectName.text()) > 0 :
            if len(self.src.text()) > 3   :
                if len(self.dest.text() ) > 3   :
                    shutil.make_archive(self.projectName.text() , 'zip', self.src.text())
                    os.cwd
                    shutil.move( self.projectName.text() +".zip" , self.dest.text() )
                    print( "done creating zip file")

                    logoImage = Image.open("logo.png")
                    imageList =  os.listdir(self.src.text())
                    for image in imageList:
                        splitImage = image.split(".")
                        if splitImage[-1] in ["png", "jpeg", "jpg" , "tif"] :
                            imagePath = os.path.join(self.src.text() , image)
                            currentImage = Image.open( imagePath).convert("RGB")
                            if self.watermark.isChecked():
                                currentImage.paste(logoImage,   ((currentImage.width - logoImage.width ), (currentImage.height - logoImage.height)))
                                print("Added watermark")

                            compressedImagePath = os.path.join(self.dest.text() ,  splitImage[-2] )
                            print(compressedImagePath)
                            currentImage.save( compressedImagePath + ".jpeg", format="jpeg" , quality=self.compression.value())
                            print( "done creating compressed images")



    def clicked_reset(self ):
        self.projectName.setText("")
        self.src.setText("...")
        self.dest.setText("...")
        self.watermark.setChecked(False)
        self.compression.setValue(100)

        
    def update_compression_val(self ):
        self.compressionVal.setText( str(self.compression.value( )))

    def initUI(self):
        self.setWindowTitle(self.title)
        self.setGeometry(self.left, self.top, self.width, self.height)
        
        self.projectNameLable = QLabel(self)
        self.projectNameLable.setText("Project Name")
        self.projectName = QLineEdit(self)

        self.src = QPushButton('...', self)
        self.srcLable = QLabel(self)
        self.srcLable.setText("Source")

        self.dest = QPushButton('...', self)
        self.destLable = QLabel(self)
        self.destLable.setText("Destination")

        self.watermark = QCheckBox( self)
        self.waterMarkLable = QLabel(self)
        self.waterMarkLable.setText("Water Mark")

        self.compression = QSlider(  Qt.Horizontal, self)
        self.compression.setValue(110)
        self.compressionLable = QLabel(self)
        self.compressionLable.setText("Compression")


        self.compressionVal = QLabel(self)
        self.compressionVal.setText( "100")

        self.confirm = QPushButton("Create files", self)
        self.reset = QPushButton("Reset", self)



        self.projectNameLable.move(100,50)
        self.projectName.move(250,50)

        self.src.move(250,100)
        self.srcLable.move(100,100)

        self.dest.move(250,150)
        self.destLable.move(100,150)

        self.watermark.move(250,200)
        self.waterMarkLable.move(100,200)

        self.confirm.move(100, 400)
        self.reset.move(200, 400)

        self.compression.move(250,250)
        self.compression.resize(200, 35)
        self.compression.setMinimum(50)
        self.compression.setMaximum(100)
        self.compressionLable.move(100,250)
        self.compressionVal.move(500,250)
        self.compressionVal.resize(35, 20)


        self.compression.valueChanged.connect(self.update_compression_val)
        self.src.clicked.connect(self.open_src)
        self.dest.clicked.connect(self.open_dest)
        
        self.confirm.clicked.connect(self.clicked_confirm)
        self.reset.clicked.connect(self.clicked_reset)
        
        self.show()




if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = App()
    sys.exit(app.exec_())
