import * as THREE from 'three'
import { Types } from 'ecsy'

class VectorComponent extends THREE.Vector3 {
  constructor () {
    super()
    this.componentConstructor()
  }

  componentConstructor (props) {
    if (props !== false) {
      const schema = this.constructor.schema

      for (const key in schema) {
        // eslint-disable-next-line no-prototype-builtins
        if (props && props.hasOwnProperty(key)) {
          this[key] = props[key]
        } else {
          const schemaProp = schema[key]
          // eslint-disable-next-line no-prototype-builtins
          if (schemaProp.hasOwnProperty('default')) {
            this[key] = schemaProp.type.clone(schemaProp.default)
          } else {
            const type = schemaProp.type
            this[key] = type.clone(type.default)
          }
        }
      }

      if (process.env.NODE_ENV !== 'production' && props !== undefined) {
        this.checkUndefinedAttributes(props)
      }
    }

    this._pool = null
  }

  copy (source) {
    const schema = this.constructor.schema

    for (const key in schema) {
      const prop = schema[key]

      // eslint-disable-next-line no-prototype-builtins
      if (source.hasOwnProperty(key)) {
        this[key] = prop.type.copy(source[key], this[key])
      }
    }

    // @DEBUG
    if (process.env.NODE_ENV !== 'production') {
      this.checkUndefinedAttributes(source)
    }

    return this
  }

  clone () {
    return new this.constructor().copy(this)
  }

  reset () {}

  dispose () {
    if (this._pool) {
      this._pool.release(this)
    }
  }

  getName () {
    return this.constructor.getName()
  }

  checkUndefinedAttributes (src) {
    const schema = this.constructor.schema

    // Check that the attributes defined in source are also defined in the schema
    Object.keys(src).forEach((srcKey) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!schema.hasOwnProperty(srcKey)) {
        console.warn(
          `Trying to set attribute '${srcKey}' not defined in the '${this.constructor.name}' schema. Please fix the schema, the attribute value won't be set`
        )
      }
    })
  }
}

VectorComponent.schema = {
  x: { type: Types.Number },
  y: { type: Types.Number },
  z: { type: Types.Number }
}
VectorComponent.isComponent = true
VectorComponent.getName = function () {
  return this.displayName || this.name
}

export { VectorComponent }
