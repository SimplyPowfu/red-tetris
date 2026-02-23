import chai from "chai"
import React from 'react'
import equalJSX from 'chai-equal-jsx'
import ShallowRenderer from 'react-shallow-renderer' 
import {Tetris, BoardDiv} from '../src/client/frontend/components/Board.jsx'

chai.should()
chai.use(equalJSX)

describe('Fake react test', function(){
  it('works', function(){
    const renderer = new ShallowRenderer()
    renderer.render(<Tetris />)
    const output = renderer.getRenderOutput()
    output.should.equalJSX(<BoardDiv/>)
  })
})