// models/User.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import Profile from './Profile'; // リレーションのためにインポート

interface UserAttributes {
  id: number;
  email: string;
  password?: string;
  name?: string;
  isVerified: boolean;
  role: 'admin' | 'official' | 'general'; // ロールを追加
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isVerified' | 'role'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password?: string;
  public name?: string;
  public isVerified!: boolean;
  public role!: 'admin' | 'official' | 'general';
  public verificationCode?: string;
  public verificationCodeExpires?: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;

  // タイムスタンプ
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'official', 'general'),
      defaultValue: 'general',
      allowNull: false,
    },
    verificationCode: {
      type: new DataTypes.STRING(6),
      allowNull: true,
    },
    verificationCodeExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: new DataTypes.STRING(64),
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    sequelize, // このモデルをシーケライゼに接続
  }
);

// リレーションを定義
User.hasOne(Profile, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'profile',
});

export default User;
