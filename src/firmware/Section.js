class Section {

  /**
    Secure DFU update section contains a bin and dat file
      bin is the binary image to transfer
      dat is the init package to send before transfering the bin
  */
  constructor (bin, dat, type) {
    this.bin = bin
    this.dat = dat
    this.type = type
  }

}

module.exports.Section = Section
