import React, {useState} from 'react'

import env from '../helpers/env'
import etv from '../helpers/eventTargetValue'

import styles from './export.module.scss'

const filterAlphaNum = (string) => {
  return string.replace(/\s/g,"_").replace(/[ÉéÈèÊêËë]/g,"e").replace(/[ÔôÖö]/g,"o").replace(/[ÂâÄäÀà]/g,"a").replace(/[Çç]/g,"c").replace(/[^A-Za-z0-9_]/g,"")  
}

export default props => {

  

  const [format, setFormat] = useState('html5')
  const [csl,setCsl] = useState('chicagomodified')
  const [toc,setToc] = useState('false')

  const startExport = () => {
    if(props.book){
      //For books
      window.open(`http://localhost:9090/cgi-bin/exportBook/exec.cgi?id=${filterAlphaNum(props.name)}&book=${props.bookId}&processor=xelatex&source=${env.EXPORT_ENDPOINT}/&format=${format}&bibstyle=${csl}&toc=${toc}`,'_blank');
    }
    else{
      //For articles/versions
      window.open(`http://localhost:9090/cgi-bin/exportArticle/exec.cgi?id=${filterAlphaNum(props.title)}v${props.version}-${props.revision}&version=${props.versionId}&processor=xelatex&source=${env.EXPORT_ENDPOINT}/&format=${format}&bibstyle=${csl}&toc=${toc}`,'_blank');
    }
  }

  return(
    <section className={styles.export}>
      <h1>export</h1>
      <form>
        <select value={format} onChange={(e)=>setFormat(etv(e))}>
          <option value="html5">HTML5</option>
          <option value="zip">ZIP</option>
          <option value="pdf">PDF</option>
          <option value="xml">XML (érudit)</option>
          <option value="odt">ODT</option>
          <option value="docx">DOCX</option>
          <option value="epub">EPUB</option>
          <option value="tei">TEI</option>
        </select>
        <select value={csl} onChange={(e)=>setCsl(etv(e))}>
          <option value="chicagomodified">chicagomodified</option>
          <option value="lettres-et-sciences-humaines-fr">lettres-et-sciences-humaines-fr</option>
          <option value="chicago-fullnote-bibliography-fr">chicago-fullnote-bibliography-fr</option>
        </select>
        <select value={toc} onChange={(e)=>setToc(etv(e))}>
          <option value={true}>Table of content</option>
          <option value={false}>No table of content</option>
        </select>
      </form>
      <nav>
        <p onClick={()=>startExport()}>Export</p>
      </nav>

    </section>
  )
}